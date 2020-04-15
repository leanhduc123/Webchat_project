const model = {
    conversations: null,  //tat car nhung cuoc hoi thoai cua user
    currentConversation: null //cuoc hoi thoai nguoi dung dang tro vao
}

model.saveConversations = function(conversations){
    model.conversations = conversations
}

model.saveCurrentConversation = function(conversation){
    model.currentConversation = conversation
}

model.updateConversation = function(conversation){
    if(model.conversations){
        let existedIndex = model.conversations.findIndex(
            function(element){
                return element.id == conversation.id
            })
        if(existedIndex >= 0) { // da ton tai trong model.conversation
            model.conversations[existedIndex] = conversation
        }else{ //chua ton tai trong model.conversation
            model.conversations.push(conversation)
        }
    }
    if(model.currentConversation && conversation.id == model.currentConversation.id) {
        console.log(model.currentConversation)
        console.log(conversation)
        model.currentConversation=conversation
    }
}

model.removeConversation = function(conversation){
    if(model.conversations){
        let existedIndex = model.conversations.findIndex(function(element){
            return element.id == conversation.id
        })
        if (existedIndex >= 0) {
            model.conversations.splice(existedIndex,1)
        }
    }
}