'use strict';

const path = require('path');
const fs = require('fs-extra');
const sendToWormhole = require('stream-wormhole');
const Controller = require('egg').Controller;
const { severBaseUrl } = require('../../config/index.js');


class ProjectController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.filePath = path.join(
      process.cwd(),
      '/app/public/files/'
    );

    this.middleFilePath = path.join(
      this.filePath,
      'middle'
    );

  }

  async success() {
    const { ctx } = this;
    const data = ctx.request.body;
    try {
      let { filename, chunkOrder, id } = data;
      const writePath = path.join(this.filePath, id, filename);
      const readPath = path.join(this.middleFilePath, id);
      fs.ensureFileSync(writePath);
      // chunkOrder为合并文件顺序序号，如果存在，则采用，否则按照文件下文件名正序合并
      if (Object.prototype.toString.call(chunkOrder) !== '[object Array]') {
        chunkOrder = (fs.readdirSync(readPath)).sort();
      }
      const writeStream = fs.createWriteStream(writePath);
      let index = 0;

      // 合并文件
      const mergeFiles = () => {
        if (index === chunkOrder.length) {
          writeStream.end();
          fs.removeSync(readPath);
          return;
        }

        const readStream = fs.createReadStream(path.join(readPath, chunkOrder[index]));
        readStream.pipe(writeStream, { end: false });

        readStream.on('end', () => {
          index += 1;
          mergeFiles();
        });
      };
      const file = {
        url: `${severBaseUrl}/files/${id}/${filename}`,
      };
      mergeFiles();
      ctx.status = 200;
      ctx.body = {
        code: 200,
        data: {
          file,
        },
        msg: '合并成功',
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: -2,
        data: '合并失败',
      };
    }

  }

  async upload() {
    const { ctx } = this;
    const parts = ctx.multipart();

    let part;
    const fileMsg = {};
    while ((part = await parts()) != null) {
      if (part.length) {
        // formData中 除二进制值之外的其他字段 比如：[ 'index', '1', false, false ]
        const [ field, data ] = part;
        fileMsg[field] = data;
      } else {
        // 文件二进制值的字段
        if (!part.filename) {
          continue;
        }
        const { id, index } = fileMsg;
        const dirPath = path.join(
          this.middleFilePath,
          id
        );
        const filePath = path.join(
          dirPath,
          index
        );

        fs.ensureDirSync(dirPath); // 确保文件目录存在

        const writable = fs.createWriteStream(filePath);
        try {
          await part.pipe(writable);
          ctx.body = {
            code: 200,
            data: '切片上传成功',
          };
        } catch (error) {
          await sendToWormhole(part);
          ctx.status = 500;
          ctx.body = {
            code: -2,
            data: '上传失败, 可能不支持此类型，需添加白名单',
          };
        }
      }
    }
  }


  // 查看是否已经存在改文件，获取目录下，文件名
  async getDirFiles() {
    const { ctx } = this;
    const { params: { id } } = ctx;
    try {
      let files = {};
      const successFilepath = path.join(this.filePath, id);
      // 如果已经存在该文件
      if (fs.pathExistsSync(successFilepath)) {
        files = {
          url: `${severBaseUrl}/files/${id}/${fs.readdirSync(successFilepath)[0]}`,
          exist: true,
        };
      } else {
        const dirPath = path.join(this.middleFilePath, id);
        fs.ensureDirSync(dirPath);
        files = {
          chunks: fs.readdirSync(dirPath),
          exist: false,
        };
      }


      ctx.status = 200;
      ctx.body = {
        code: 200,
        data: files,
        message: '成功',
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        code: -2,
        data: '获取文件失败',
      };
    }

  }
}

module.exports = ProjectController;
