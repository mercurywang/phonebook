const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  );
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://mercury:${password}@mercury.plu3l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  console.log('phonebook:');
  Person.find({}).then((result) => {
    result.forEach(({ name, number }) => {
      console.log(`${name} ${number}`);
    });
    mongoose.connection.close();
  });
}

if (process.argv.length > 3) {
  const name = process.argv[3];
  const number = process.argv[4];

  const person = new Person({
    id: 200000,
    name,
    number
  });

  person.save((error, response) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`added ${name} number ${number} to phonebook`);
      mongoose.connection.close();
    }
  });
}
