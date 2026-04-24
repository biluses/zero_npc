'use client';

/**
 * Parsea errores del backend Zod en el formato { status:'error', details:[{path, message}] }
 * a un objeto plano { [campo]: mensaje } consumible por forms.
 *
 * También maneja errores que no vienen con details (ej. 409 ConflictError) devolviendo
 * un mensaje genérico bajo la key `_form`.
 */
export function parseBackendErrors(err) {
  const response = err?.response?.data;
  const errors = {};

  if (Array.isArray(response?.details)) {
    for (const d of response.details) {
      // Zod devuelve path con strings o arrays. Tomamos el último segmento significativo.
      const key = Array.isArray(d.path) ? d.path.filter(Boolean).pop() : d.path;
      const cleanKey = typeof key === 'string' ? key : String(key || '_form');
      if (cleanKey) errors[cleanKey] = d.message || 'Campo inválido';
    }
  }

  // Si no vinieron details estructurados pero sí message, lo metemos en _form.
  if (Object.keys(errors).length === 0 && response?.message) {
    errors._form = response.message;
  }

  // Si no hay nada útil, mensaje genérico.
  if (Object.keys(errors).length === 0) {
    errors._form = err?.message || 'Error desconocido';
  }

  return errors;
}

/**
 * Extrae el primer mensaje útil de un error backend (para toast global).
 */
export function firstErrorMessage(err, fallback = 'Error en el servidor') {
  const response = err?.response?.data;
  if (Array.isArray(response?.details) && response.details.length > 0) {
    return response.details[0].message || fallback;
  }
  return response?.message || err?.message || fallback;
}
