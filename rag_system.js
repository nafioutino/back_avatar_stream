import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pdfFiles } from "./data.js";
import { ZhipuAIEmbeddings } from "@langchain/community/embeddings/zhipuai";

// Fonction pour charger les documents PDF
const loadPDFs = async (pdfPaths) => {
  const allDocs = [];
  for (const pdfPath of pdfPaths) {
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    let fullText = "";
    for (const doc of docs) {
      fullText += doc.pageContent;
    }
    allDocs.push({ pageContent: fullText, metadata: { source: pdfPath } });
  }
  return allDocs;
};

// Fonction pour diviser le texte en chunks
const splitText = async (docs) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    separators: ["\n", "\n\n", " ", ""],
    chunkSize: 5000,
    chunkOverlap: 200,
  });
  
  const splits = await textSplitter.splitDocuments(docs);
  return splits;
};

// Fonction pour créer le store vectoriel
const createVectorStore = async (documents) => {
  return await MemoryVectorStore.fromDocuments(
    documents,
    new ZhipuAIEmbeddings({
      apiKey: "2b7fddcc17953ac04c59f3f1f73126a1.LnEmBmyBbYpx8QEI",
    })
  );
};

// Fonction principale pour orchestrer le chargement et la préparation des documents
const initializeRetriever = async () => {
  const allDocs = await loadPDFs(pdfFiles);
  const splits = await splitText(allDocs);
  const vectorStore = await createVectorStore(splits);  
  return vectorStore.asRetriever();
};
initializeRetriever();

// Initialiser le retriever et l'exporter
const retriever = await initializeRetriever();

export { retriever };