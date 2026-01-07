import api from './api';

export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
  fechaCreacion: string;
}

export interface CrearEmpleadoForm {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  password: string;
}

export const empleadoService = {
  // Obtener todos los empleados
  async getEmpleados(): Promise<Empleado[]> {
    const response = await api.get('/empleados');
    return response.data.empleados;
  },

  // Obtener un empleado específico
  async getEmpleado(id: number): Promise<Empleado> {
    const response = await api.get(`/empleados/${id}`);
    return response.data.empleado;
  },

  // Crear nuevo empleado
  async crearEmpleado(datos: CrearEmpleadoForm): Promise<{ mensaje: string; empleado: Empleado }> {
    const response = await api.post('/empleados', datos);
    return response.data;
  },

  // Actualizar empleado
  async actualizarEmpleado(
    id: number,
    datos: Partial<Omit<CrearEmpleadoForm, 'password'>>
  ): Promise<{ mensaje: string; empleado: Empleado }> {
    const response = await api.put(`/empleados/${id}`, datos);
    return response.data;
  }
};
