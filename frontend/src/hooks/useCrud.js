import { useState, useEffect, useCallback } from 'react';

/**
 * Hook reutilizable para gestionar operaciones CRUD y estado de tablas
 */
export function useCrud(service, defaultParam = false) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const notificarExito = (msg) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(''), 3500);
  };

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const data = await service.getAll(defaultParam);
      // Soporta diferentes nombres de propiedad devueltos por el backend
      setItems(data.usuarios || data.productos || data.servicios || data.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos.');
    } finally {
      setCargando(false);
    }
  }, [service, defaultParam]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async (id, datos, isCrear = false) => {
    try {
      if (isCrear) {
        await service.create(datos);
        notificarExito('Registro creado exitosamente.');
      } else {
        await service.update(id, datos);
        notificarExito('Registro actualizado correctamente.');
      }
      cargar();
      return true;
    } catch (err) {
      alert(err.message || 'Error al guardar los datos.');
      return false;
    }
  };

  const alternarEstado = async (id, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
      await service.changeStatus(id, nuevoEstado);
      notificarExito(`Estado modificado a ${nuevoEstado}.`);
      cargar();
    } catch (err) {
      alert(err.message || 'Error al cambiar estado.');
    }
  };

  const eliminar = async (id) => {
    try {
      await service.delete(id);
      notificarExito('Registro eliminado permanentemente.');
      cargar();
      return true;
    } catch (err) {
      alert(err.message || 'Error al eliminar el registro.');
      return false;
    }
  };

  return {
    items,
    cargando,
    error,
    mensajeExito,
    cargar,
    guardar,
    alternarEstado,
    eliminar,
  };
}
