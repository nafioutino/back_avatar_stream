// import { ChatZhipuAI } from "@langchain/community/chat_models/zhipuai";
// import { HumanMessage } from "@langchain/core/messages";

// // Use glm-4
// const glm4 = new ChatZhipuAI({
//   model: "glm-4", // Available models:
//   temperature: 1,
//   zhipuAIApiKey: "2b7fddcc17953ac04c59f3f1f73126a1.LnEmBmyBbYpx8QEI", // In Node.js defaults to process.env.ZHIPUAI_API_KEY
// });

// const messages = [new HumanMessage("Salut parle moi de l'IA ")];





// const res2 = await glm4.invoke(messages);
// console.log(res2.content);

// import { ZhipuAIEmbeddings } from "@langchain/community/embeddings/zhipuai";

// const model = new ZhipuAIEmbeddings({apiKey:"2b7fddcc17953ac04c59f3f1f73126a1.LnEmBmyBbYpx8QEI"});
// const embed = await model.embedQuery(
//   "What would be a good company name a company that makes colorful socks?"
// );
// console.log({ embed });



import { AssistantEvolveMind } from "./openai_assistant.js"; // Remplace par le chemin correct

const apiKey = '2b7fddcc17953ac04c59f3f1f73126a1.LnEmBmyBbYpx8QEI'; // Remplace par ta clé API

const assistant = new AssistantEvolveMind(apiKey);

(async () => {
  await assistant.initialize(); // Initialiser l'assistant

  const userMessage = " Hilary ZOGO"; // Exemple de message utilisateur
  const response = await assistant.getResponse(userMessage); // Obtenir la réponse
  console.log("Assistant:", response); // Afficher la réponse
})();