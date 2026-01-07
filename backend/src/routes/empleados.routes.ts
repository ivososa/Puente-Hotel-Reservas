import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { verificarToken, verificarResponsable, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Obtener todos los empleados (solo responsables)
router.get('/', verificarToken, verificarResponsable, async (req: AuthRequest, res) => {
  try {
    console.log('[GET /empleados] Obteniendo lista de empleados');

    const empleados = await prisma.usuario.findMany({
      where: {
        rol: 'RESPONSABLE'
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        rol: true,
        fechaCreacion: true
      },
      orderBy: {
        fechaCreacion: 'desc'
      }
    });

    console.log('[GET /empleados] Empleados encontrados:', empleados.length);

    res.json({ empleados });
  } catch (error) {
    console.error('[GET /empleados] Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error al obtener empleados.' });
  }
});

// Crear nuevo empleado (solo responsables)
router.post('/', verificarToken, verificarResponsable, async (req: AuthRequest, res) => {
  try {
    const { nombre, apellido, telefono, email, password } = req.body;

    console.log('[POST /empleados] Creando nuevo empleado:', { nombre, apellido, email });

    // Validaciones básicas
    if (!nombre || !apellido || !telefono || !email || !password) {
      console.log('[POST /empleados] Falta campos obligatorios');
      return res.status(400).json({
        error: 'Todos los campos son obligatorios: nombre, apellido, teléfono, email y contraseña.'
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 4 caracteres.'
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      console.log('[POST /empleados] Email ya existe:', email);
      return res.status(400).json({
        error: 'Ya existe una cuenta con este email.'
      });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear empleado
    const nuevoEmpleado = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        telefono,
        email,
        passwordHash,
        rol: 'RESPONSABLE' // Los empleados son responsables
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        rol: true,
        fechaCreacion: true
      }
    });

    console.log('[POST /empleados] Empleado creado:', nuevoEmpleado.id);

    res.status(201).json({
      mensaje: '¡Empleado creado exitosamente!',
      empleado: nuevoEmpleado
    });
  } catch (error) {
    console.error('[POST /empleados] Error al crear empleado:', error);
    res.status(500).json({ error: 'Error al crear el empleado.', detalles: (error as any).message });
  }
});

// Obtener un empleado específico (solo responsables)
router.get('/:id', verificarToken, verificarResponsable, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    console.log('[GET /empleados/:id] Obteniendo empleado:', id);

    const empleado = await prisma.usuario.findFirst({
      where: {
        id: parseInt(id),
        rol: 'RESPONSABLE'
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        rol: true,
        fechaCreacion: true
      }
    });

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado.' });
    }

    res.json({ empleado });
  } catch (error) {
    console.error('[GET /empleados/:id] Error:', error);
    res.status(500).json({ error: 'Error al obtener empleado.' });
  }
});

// Actualizar empleado (solo responsables)
router.put('/:id', verificarToken, verificarResponsable, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, email } = req.body;

    console.log('[PUT /empleados/:id] Actualizando empleado:', id);

    // Validaciones básicas
    if (!nombre || !apellido || !telefono || !email) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios: nombre, apellido, teléfono, email.'
      });
    }

    // Verificar si el empleado existe y es responsable
    const empleadoExistente = await prisma.usuario.findFirst({
      where: {
        id: parseInt(id),
        rol: 'RESPONSABLE'
      }
    });

    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado.' });
    }

    // Si cambia el email, verificar que no esté en uso
    if (email !== empleadoExistente.email) {
      const emailEnUso = await prisma.usuario.findUnique({
        where: { email }
      });

      if (emailEnUso) {
        return res.status(400).json({
          error: 'Ya existe una cuenta con este email.'
        });
      }
    }

    // Actualizar empleado
    const empleadoActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        apellido,
        telefono,
        email
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        rol: true,
        fechaCreacion: true
      }
    });

    console.log('[PUT /empleados/:id] Empleado actualizado:', empleadoActualizado.id);

    res.json({
      mensaje: 'Empleado actualizado correctamente.',
      empleado: empleadoActualizado
    });
  } catch (error) {
    console.error('[PUT /empleados/:id] Error:', error);
    res.status(500).json({ error: 'Error al actualizar empleado.' });
  }
});

export default router;
