const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

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

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122'
  }
];

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.get('/info', (request, response) => {
  const date = new Date();
  const count = persons.length;
  response.send(
    `<div>
      <p>Phonebook has info for ${count} people</p>
      <p>${date}</p>
    </div>`
  );
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
};

const generateId = () => {
  const id = getRandomInt(10000000, 200000000);
  return id;
};

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: 'Name missing'
    });
  }

  const nameAlreadyExists = persons.find(
    (person) => person.name.toLowerCase() === body.name.toLowerCase()
  );

  if (nameAlreadyExists) {
    return response
      .status(400)
      .json({ error: `${body.name} has already been added to the phonebook` });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  };

  persons = persons.concat(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
