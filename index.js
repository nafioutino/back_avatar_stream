import fs from "fs";
import express from "express";
import cors from "cors";
import url from "url";
import { AssistantEvolveMind } from "./openai_assistant.js";
const app = express();
app.use(cors())
app.use(express.json()); // Middleware pour analyser les requêtes JSON

const hostname = "127.0.0.1"
const port = 80;

const apiKey = '2b7fddcc17953ac04c59f3f1f73126a1.LnEmBmyBbYpx8QEI'
const assistant = new AssistantEvolveMind(apiKey);


// Route GET pour récupérer les données
app.get("/", (req, res) => {
  fs.readFile("data.json", "utf-8", (err, existingData) => {
    if (err) {
      console.error("Erreur lors de la lecture du fichier:", err);
      return res.status(500).send("Erreur serveur.");
    }

    try {
      const data = JSON.parse(existingData);
      res.json(data);
    } catch (parseErr) {
      console.error("Erreur lors de l'analyse des données JSON:", parseErr);
      res.status(500).send("Erreur dans le format du fichier JSON.");
    }
  });
});

// Route POST pour envoyer des données
app.post("/post", (req, res) => {
  const newData = req.body;

  if (!newData || typeof newData !== "object") {
    return res.status(400).send("Données invalides.");
  }

  fs.readFile("data.json", "utf-8", (err, existingData) => {
    if (err && err.code !== "ENOENT") {
      console.error("Erreur lors de la lecture du fichier:", err);
      return res.status(500).send("Erreur serveur.");
    }

    const jsonData = existingData ? JSON.parse(existingData) : [];
    const nextId = jsonData.length > 0 ? jsonData[jsonData.length - 1].id + 1 : 1;

    const entry = {
      id: nextId,
      status: "en attente", // Statut par défaut
      ...newData,
    };

    jsonData.push(entry);

    fs.writeFile("data.json", JSON.stringify(jsonData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Erreur lors de l'écriture dans le fichier:", writeErr);
        return res.status(500).send("Erreur serveur.");
      }

      res.status(201).json(entry);
    });
  });
});


app.post("/assistant", async (req, res) => {
  const userMessage = req.body.message; // Récupérer le message de l'utilisateur

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).send("Message invalide.");
  }

  try {
    const response = await assistant.getResponse(userMessage); // Obtenir la réponse de l'assistant

    // Récupérer les documents pertinents pour les inclure dans la réponse
    const relevantDocs = await assistant.getRelevantDocuments(userMessage);

    res.json({ response, relevantDocs }); // Retourner la réponse et les documents pertinents au frontend
  } catch (error) {
    console.error("Erreur lors de la récupération de la réponse de l'assistant:", error);
    res.status(500).send("Erreur serveur.");
  }
});

// Route PATCH pour mettre à jour des données
app.patch("/update", (req, res) => {
  const parsedUrl = url.parse(req.url, true); // Analyse de l'URL
  const id = parseInt(parsedUrl.query.id, 10);

  if (isNaN(id)) {
    return res.status(400).send("ID invalide ou manquant.");
  }

  const { status } = req.body;

  if (!status || typeof status !== "string") {
    return res.status(400).send("Le champ 'status' est requis et doit être une chaîne.");
  }

  fs.readFile("data.json", "utf-8", (err, existingData) => {
    if (err) {
      console.error("Erreur lors de la lecture du fichier:", err);
      return res.status(500).send("Erreur serveur.");
    }

    let jsonData;
    try {
      jsonData = JSON.parse(existingData);
    } catch (parseErr) {
      console.error("Erreur lors de l'analyse des données JSON:", parseErr);
      return res.status(500).send("Erreur dans le format du fichier JSON.");
    }

    const entryIndex = jsonData.findIndex((entry) => entry.id === id);

    if (entryIndex === -1) {
      return res.status(404).send("Entrée non trouvée.");
    }

    jsonData[entryIndex].status = status;

    fs.writeFile("data.json", JSON.stringify(jsonData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Erreur lors de l'écriture dans le fichier:", writeErr);
        return res.status(500).send("Erreur serveur.");
      }

      res.status(200).json(jsonData[entryIndex]);
    });
  });
});

// Démarrer le serveur
app.listen( port, hostname,() => {
  console.log(`Serveur démarré sur le port: ${port}`);
  console.log(`Server is running on http://${hostname}:${port}`);
});
