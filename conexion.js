const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 3000; // Puedes ajustar el número de puerto según tus necesidades

// Configurar Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

// Configurar Express.js para servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Middleware para procesar datos enviados en formularios
app.use(express.urlencoded({ extended: true }));


// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'atrellusx',
  database: 'laboratorio15'
});
// Conexión a la base de datos
connection.connect((error) => {
  if (error) {
    console.error('Error al conectar a MySQL: ', error);
    return;
  }
  console.log('Conexión exitosa a MySQL');
});

// Ejecutar una consulta SELECT
connection.query('SELECT * FROM alumnos', (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta: ', error);
      return;
    }
    //console.log('Resultados de la consulta: ', results);
  });

  // Ruta principal
app.get('/', (req, res) => {
    // Realizar consulta a la base de datos
    connection.query('SELECT * FROM alumnos', (error, resultados) => {
      if (error) {
        console.error('Error al obtener los datos: ', error);
        return;
      }
      // Renderizar la vista y pasar los resultados a través del objeto locals
      //console.log(resultados)
      res.render('index', { datos: resultados })
      ;
    });
  });

  app.get('/notas/:id', async (req, res) => {
    const alumnoId = req.params.id;

    try {
      // Realizar consulta a la base de datos utilizando el ID del alumno
      const notasQuery = new Promise((resolve, reject) => {
        connection.query(
          'SELECT alumnos.columna1, notas.nota FROM alumnos JOIN notas ON alumnos.id = notas.alumno_id WHERE alumnos.id = ?',
          [alumnoId],
          (error, resultados) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(resultados);
          }
        );
      });
  
      const alumnoQuery = new Promise((resolve, reject) => {
        connection.query(
          'SELECT alumnos.columna1,alumnos.id FROM alumnos WHERE alumnos.id = ?',
          [alumnoId],
          (error, resultados) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(resultados);
          }
        );
      });
  
      const datosNotas = await notasQuery;
      const datosAlumnos = await alumnoQuery;
      console.log(datosAlumnos);
      console.log(datosNotas)
  
      res.render('notas', { datosNotas, datosAlumnos });
    } catch (error) {
      console.error('Error al obtener las notas del alumno: ', error);
      res.status(500).send('Error al obtener los datos');
    }
  });
  

  //Agregar nota
  app.post('/guardar-nota', (req, res) => {
    const alumno_id = req.body.alumno_id
    const nota = req.body.nota;
    // Aquí puedes agregar el código para insertar el nuevo dato en la base de datos

    const consulta2 = 'INSERT INTO notas (id,alumno_id,nota) VALUES (null,?,?)';
    
    // Ejecutar la consulta de inserción
    connection.query(consulta2, [alumno_id,nota], (error, results) => {
        if (error) {
          console.error('Error al insertar datos: ', error);
          return;
        }
        console.log('Dato insertado exitosamente');
      });
      res.redirect('/');
    
  });
  
  
  // Manejar la solicitud POST para agregar datos
app.post('/', (req, res) => {
    const nombre = req.body.nombre;
    const anio= parseInt(req.body.anio);
    const curso = req.body.curso;
    // Aquí puedes agregar el código para insertar el nuevo dato en la base de datos
  
    // Consulta SQL de inserción
    const consulta = 'INSERT INTO alumnos (id,columna1,columna2,columna3) VALUES (null,?,?,?)';

    // Ejecutar la consulta de inserción
    connection.query(consulta, [nombre,anio,curso], (error, results) => {
        if (error) {
          console.error('Error al insertar datos: ', error);
          return;
        }
        console.log('Dato insertado exitosamente');
        res.redirect('/');

      });
    
  });

  //Eliminar nota
  app.post('/eliminar-nota/:id', (req, res) => {
    const alumno_id = req.params.id;
    console.log(alumno_id)

    connection.query('DELETE FROM notas WHERE alumno_id = ?', [alumno_id], (error, results) => {
      if (error) {
        console.error('Error al eliminar la nota:', error);
        res.status(500).json({ error: 'Error al eliminar la nota' });
        return;
      }
      res.redirect('/');
    });
  });

  //editar nota
  app.post('/editar-nota', (req, res) => {
    const alumno_id = req.body.alumno_id;
    const nueva_nota = req.params.nuevaNota;
    console.log(alumno_id)

    // Realiza la consulta para actualizar la nota del alumno
    connection.query('UPDATE notas SET nota = ? WHERE alumno_id = ?', [nueva_nota, alumno_id], (error, results) => {
      if (error) {
        console.error('Error al editar la nota:', error);
        res.status(500).json({ error: 'Error al editar la nota' });
        return;
      }
      res.redirect('/');
      
    });
  });

// Cerrar la conexión cuando sea necesario
// connection.end();

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor en ejecución en http://localhost:${port}`);
  });
  
