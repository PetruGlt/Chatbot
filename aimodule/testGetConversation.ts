import { getConversation } from "./src/services/conversationSerivce";

async function main(){
    const conversationId = 1;
    const conversation = await getConversation(conversationId);

    console.log(JSON.stringify(conversation, null, 2));    
}

main()
    .catch((e) => {
        console.error('Error:', e);
    })
    .finally(() => {
        process.exit(0);
    });