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

app.get('/info', (request, response) => {
  const date = new Date();
  Person.count({}).then((count) => {
    response.send(
      `<div>
        <p>Phonebook has info for ${count} people</p>
        <p>${date}</p>
      </div>`
    );
  });
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name missing' });
  }

  const person = new Person({
    name: body.name,
    number: body.number
  });

  person
    .save()
    .then((savedPerson) => savedPerson.toJSON())
    .then((savedAndFormattedPerson) => {
      response.json(savedAndFormattedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true
  })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
