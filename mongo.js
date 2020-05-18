require("dotenv").config();
const mongoose = require("mongoose");

const name = process.argv[2];
const number = process.argv[3];

const url = process.env.MONGODB_URI;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({ name, number });

const closeConnetion = () => {
  mongoose.connection.close();
};

const printPersons = () => {
  Person.find({}).then((result) => {
    console.log("*** All persons in phonebook ***");
    result.forEach((person) => {
      console.log(person);
    });
    closeConnetion();
  });
};

const savePerson = () => {
  person.save().then((result) => {
    console.log("person saved!", result);
    closeConnetion();
  });
};

if (process.argv.length < 3) {
  printPersons();
} else if (process.argv.length < 4) {
  console.log("give number as argument for the person");
  process.exit(1);
} else {
  savePerson();
}
