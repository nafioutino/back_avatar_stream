import { ChatZhipuAI } from "@langchain/community/chat_models/zhipuai";
import { HumanMessage } from "@langchain/core/messages";
import { retriever } from "./rag_system.js";

export class AssistantEvolveMind {
  constructor(apiKey) {
    // Utiliser glm-4
    this.client = new ChatZhipuAI({
      model: "glm-4",
      temperature: 1,
      zhipuAIApiKey: apiKey, // Passer l'API key ici
    });

    this.messages = [];
  }

  async initialize(instructions = this.getDefaultInstructions()) {
    // Initialiser avec les instructions
    this.messages.push(new HumanMessage(instructions));
  }

  getDefaultInstructions() {
    return `Tu es EVOLVE MIND,

    Règles de comportement :
    Langue et identification :
    
    Réponds dans la langue utilisée par l’utilisateur. Identifie son nom, si disponible, et utilise-le pour personnaliser ton discours.
    Personnalité et ton :
    Tu es un(e) animateur(trice) de radio virtuel(le) énergique et captivant(e). Ton rôle est d'apporter de la joie, de l’humour, et une touche de répartie dans tes réponses. Inspire confiance, sois amical(e), et diffuse une énergie positive à chaque interaction.
    Parle avec l’enthousiasme et l’imprévisibilité d’un(e) professionnel(le) des ondes, en alternant blagues légères, anecdotes et encouragements adaptés au contexte.
    Traitement des questions :
    Reformule systématiquement la question de l'utilisateur de manière naturelle et engageante, comme si tu "te connectais à ton audience". Exemple : “Ah, super question, [Nom]! Tu veux savoir…”
    Sois direct(e) et affirmatif(ve), sans hésitations comme "il semble", "peut-être" ou "je pense". Transmets des réponses claires, mais ajoute un brin de malice ou d’humour léger pour garder une ambiance détendue.
    Style conversationnel :
    Utilise un langage chaleureux, inclusif, et dynamique, évitant les formulations robotiques ou trop formelles. Privilégie des expressions comme :
    “Allez, attache ta ceinture, voici la réponse !”
    “Ah, celle-là, c’est ma préférée, écoute bien…”
    N’hésite pas à ponctuer tes réponses de phrases motivantes ou humoristiques pour laisser un sourire à ton utilisateur, comme un animateur qui finit toujours sur une note positive.`;
  }

  async getRelevantDocuments(userMessage) {
    // Récupérer les documents pertinents avec le retriever
    const relevantDocs = await retriever.getRelevantDocuments(userMessage);

    if (!relevantDocs || relevantDocs.length === 0) {
      return null; // Aucun document pertinent trouvé
    }

    return relevantDocs;
  }

  async generatePrompt(userMessage, relevantDocs) {
    const context = relevantDocs
      .map((doc) => doc.pageContent) // Extraire le contenu des documents
      .join("\n\n"); // Combiner les documents en un seul contexte textuel

    // Ajouter le contexte au message de l'utilisateur
    return `
      Voici des informations pertinentes basées sur des données récupérées :
      ${context}

      Question de l'utilisateur :
      ${userMessage}
    `;
  }

  async getResponse(userMessage) {
    try {
      const relevantDocs = await this.getRelevantDocuments(userMessage);
      console.log(relevantDocs);
      
      if (!relevantDocs) {
        return "Aucun document pertinent trouvé.";
      }

      const promptWithDocs = await this.generatePrompt(userMessage, relevantDocs);

      // Ajouter le message au tableau de messages
      this.messages.push(new HumanMessage(promptWithDocs));

      // Appeler le modèle pour obtenir une réponse
      const response = await this.client.invoke(this.messages);

      // Retourner le contenu de la réponse
      return response.content || "Désolé, je n'ai pas pu traiter votre requête.";
    } catch (error) {
      console.error("Erreur lors de la récupération des documents pertinents:", error);
      return "Une erreur est survenue lors du traitement de votre requête.";
    }
  }
}