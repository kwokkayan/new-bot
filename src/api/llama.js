import {fileURLToPath} from "url";
import path from "path";
import {LlamaModel, LlamaContext, LlamaChatSession, ChatPromptWrapper} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const model = new LlamaModel({
    modelPath: path.join(__dirname, "models", "llama-2-7b-chat.Q2_K.gguf")
});

class MyCustomChatPromptWrapper extends ChatPromptWrapper {
  wrapperName = "MyCustomChat";
  
  wrapPrompt(prompt, {systemPrompt, promptIndex}) {
    systemPrompt = `
      You are a chat bot that gives answers in less than 10 words. 
      If you try to answer more than 10 words, then stop immediately. 
      If you don't know the answer to a question, randomly answer the question, 
      but do not say you don't know the answer!
    `
    if (promptIndex === 0) {
        return systemPrompt + "\n[INST] " + prompt + "[/INST]\nASSISTANT:";
    } else {
        return "[INST]" + prompt + "[/INST]\nASSISTANT:";
    }
  }

  getStopStrings() {
      return ["USER:"];
  }

  getDefaultStopString() {
      return "USER:";
  }
}

export const context = new LlamaContext({model, batchSize: 4096, threads: 6});
export const session = new LlamaChatSession({
  context,
  promptWrapper: new MyCustomChatPromptWrapper() 
});