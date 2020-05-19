require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const app = express();

morgan.token("body", (req) => JSON.stringify(req.body));

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/info", (_req, res) => {
  Person.find({}).then((persons) => {
    const content = `
    Phonebook has total ${persons.length} persons in it!<br><br>
    ${new Date()}
  `;
    res.send(content);
  });
});

app.get("/api/persons", (_req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons.map((person) => person.toJSON()));
    })
    .catch((e) => next(e));
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;

  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person.toJSON());
      } else {
        res.status(404).end();
      }
    })
    .catch((e) => next(e));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;

  Person.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch((e) => next(e));
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  const { name, number } = req.body;

  const person = { name, number };

  Person.findByIdAndUpdate(id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson.toJSON());
    })
    .catch((e) => next(e));
});

app.post("/api/persons", (req, res, next) => {
  const { name, number } = req.body;
  let error = "";

  if (!name || !number) {
    error = "Name and number are required";
  }

  if (error) {
    return res.status(400).json({ error });
  }

  const person = new Person({ name, number });

  person
    .save()
    .then((savedPerson) => savedPerson.toJSON())
    .then((formattedPerson) => {
      res.json(formattedPerson);
    })
    .catch((e) => next(e));
});

const unknownEndpoint = (_req, res) => {
  res.status(404).send(`{ error: 'unknown endpoint' }`);
};

const errorHandler = (error, _req, res, next) => {
  console.log(res);
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
