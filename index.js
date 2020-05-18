const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

morgan.token("body", (req) => JSON.stringify(req.body));

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

const PORT = process.env.PORT || 3001;

let persons = [
  {
    name: "Arto Hellas",
    number: "040040487",
    id: 1,
  },
  {
    name: "Teppo Winnipeg",
    number: "040040480",
    id: 2,
  },
  {
    name: "Uolevi Sinisilmä",
    number: "040666487",
    id: 3,
  },
  {
    name: "Marjatta Sinisilmä",
    number: "040664487",
    id: 4,
  },
];

app.get("/info", (_req, res) => {
  const content = `
    Phonebook has total ${persons.length} persons in it!<br><br>
    ${new Date()}
  `;
  res.send(content);
});

app.get("/api/persons", (_req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  const { name, number } = body;
  const nameExists = persons.some((person) => person.name === name);
  const id = Math.floor(Math.random() * 9999999);
  let error = "";

  if (!name || !number) {
    error = "Name and number are required";
  } else if (nameExists) {
    error = `Person with name ${name} is already saved`;
  }

  if (error) {
    return res.status(400).json({ error });
  }

  const person = { name, number, id };

  persons = persons.concat(person);

  res.json(person);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
