require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

app.use(
  morgan('tiny', {
    skip: (request) => {
      return request.method === 'POST';
    }
  })
);

morgan.token('body', (req) => {
  return JSON.stringify(req.body);
});

const custom =
  ':method :url :status :res[content-length] - :response-time ms :body';
app.use(
  morgan(custom, {
    skip: (request) => {
      return request.method !== 'POST';
    }
  })
);

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then((data) => {
      response.json(data);
    })
    .catch((error) => console.log(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

// app.get('/info', (request, response) => {
//   const date = new Date();
//   const count = persons.length;
//   response.send(
//     `<div>
//       <p>Phonebook has info for ${count} people</p>
//       <p>${date}</p>
//     </div>`
//   );
// });

// app.delete('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id);
//   const persons = persons.filter((person) => person.id !== id);

//   response.status(204).end();
// });

// const getRandomInt = (min, max) => {
//   min = Math.ceil(min);
//   max = Math.floor(max);

//   return Math.floor(Math.random() * (max - min)) + min;
// };

// const generateId = () => {
//   const id = getRandomInt(10000000, 200000000);
//   return id;
// };

app.post('/api/persons', (request, response) => {
  const body = request.body;

  // if (!body.name) {
  //   return response.status(400).json({
  //     error: 'Name missing'
  //   });
  // }

  // const nameAlreadyExists = persons.find(
  //   (person) => person.name.toLowerCase() === body.name.toLowerCase()
  // );

  // if (nameAlreadyExists) {
  //   return response
  //     .status(400)
  //     .json({ error: `${body.name} has already been added to the phonebook` });
  // }

  const person = new Person({
    name: body.name,
    number: body.number
  });

  person.save((error, data) => {
    if (error) {
      console.log(error);
    } else {
      response.json(data);
    }
  });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
