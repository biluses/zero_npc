'use strict';

const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const multer = require('multer');
const { loadEnv } = require('../config/env');
const { BadRequestError } = require('./errors');

const env = loadEnv();

const ALLOWED_MIMETYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Multer middleware para upload de imágenes en memoria (RAM).
 * Validación: MIME en whitelist, max size desde env.
 *
 * Uso:
 *   const upload = require('../../utils/upload');
 *   router.post('/avatar', requireAuth, upload.image('avatar'), ctrl.uploadAvatar);
 *
 * En el handler: `req.file.buffer` + `req.file.mimetype` están disponibles.
 * Llamar `saveUpload(req.file.buffer, req.file.mimetype, 'avatars')` para persistir.
 */
const memoryStorage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIMETYPES.has(file.mimetype)) {
    return cb(new BadRequestError(`Tipo de archivo no permitido: ${file.mimetype}`));
  }
  return cb(null, true);
}

const baseUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    files: 1,
  },
  fileFilter,
});

/**
 * Devuelve un middleware multer single() para el campo dado.
 */
function image(fieldName) {
  return baseUpload.single(fieldName);
}

/**
 * Persiste el buffer en disco bajo `UPLOAD_DIR/<subdir>/<uuid>.<ext>`
 * y devuelve la URL pública relativa al servidor (`/uploads/<subdir>/<file>`).
 *
 * Path traversal: subdir validado contra whitelist; nombre del archivo
 * generado con UUID + extensión derivada del mimetype. Nunca usa el nombre original.
 */
const ALLOWED_SUBDIRS = new Set(['avatars', 'posts', 'products']);

async function saveUpload(buffer, mimetype, subdir) {
  if (!ALLOWED_SUBDIRS.has(subdir)) {
    throw new BadRequestError(`Subdirectorio no permitido: ${subdir}`);
  }
  const ext = EXT_BY_MIME[mimetype];
  if (!ext) throw new BadRequestError('Mimetype no soportado para upload');

  const dir = path.resolve(env.UPLOAD_DIR, subdir);
  await fs.mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const fullPath = path.join(dir, filename);
  await fs.writeFile(fullPath, buffer);

  // URL pública servida por express.static('/uploads', UPLOAD_DIR)
  return `/uploads/${subdir}/${filename}`;
}

module.exports = { image, saveUpload };
