const view = {}

view.showComponent = function (name) {
    switch (name) {
        case 'register': {
            let app = document.getElementById("app")
            app.innerHTML = component.register

            let formLink = document.getElementById("form-link")
            formLink.onclick = linkClickHandler

            let form = document.getElementById("register-form")
            form.onsubmit = formSubmitHandler

            function formSubmitHandler(event) {
                event.preventDefault() // chan su kien măc dinh - khong gui thong tin user len thanh dia chi

                //1.lay thong tin nguoi dung vao form
                let registerInfo = {
                    firstname: form.firstname.value,
                    lastname: form.lastname.value,
                    email: form.email.value,
                    password: form.password.value,
                    confirmPassword: form.confirmPassword.value
                }
                let validateResult = [
                    view.validate(registerInfo.firstname, "firstname-error", "Invalid firstname!"),
                    view.validate(registerInfo.lastname, "lastname-error", "Invalid lastname!"),
                    view.validate(registerInfo.email, "email-error", "Invalid email!"),
                    view.validate(registerInfo.password && registerInfo.password.length >= 6,
                        "password-error",
                        "Invalid password!"),
                    view.validate(registerInfo.confirmPassword && registerInfo.confirmPassword == registerInfo.password,
                        "confirmPassword-error",
                        "Invalid confirm password!")
                ]
                if (allPassed(validateResult)) {
                    //submit thong tin
                    controller.register(registerInfo)
                }
            }

            function linkClickHandler() {
                view.showComponent("logIn")
            }

            break
        }
        case "logIn": {
            let app = document.getElementById("app")
            app.innerHTML = component.logIn

            let formLink = document.getElementById("form-link")
            formLink.onclick = linkClickHandler

            let form = document.getElementById("login-form")
            form.onsubmit = formSubmitHandler

            function linkClickHandler() {
                view.showComponent('register')
            }

            function formSubmitHandler(event) {
                event.preventDefault()
                let logInInfo = {
                    email: form.email.value,
                    password: form.password.value
                }
                let validateResult = [
                    view.validate(logInInfo.email, "email-error", "Invalid email!"),
                    view.validate(logInInfo.password && logInInfo.password.length >= 6,
                        "password-error",
                        "Invalid password")
                ]
                if (allPassed(validateResult)) {
                    controller.logIn(logInInfo)
                }


            }
            break
        }

        case "chatBox": {
            let app = document.getElementById("app")
            app.innerHTML = component.nav + component.chat

            controller.loadConversation()
            controller.setupOnSnapShot() //nhan thay doi tu database

            let btnSignOut = document.getElementById("btn-icon")
            btnSignOut.onclick = signOutHandler

            let formChat = document.getElementById("form-chat")
            formChat.onsubmit = formChatSubmitHandler

            let formAddConversation = document.getElementById("form-add-conversation")
            formAddConversation.onsubmit = formAddSubmitHandler

            let btnLeaveConversation = document.getElementById("leave-conversation-btn")
            btnLeaveConversation.onclick = leaveConversationHandler


            function signOutHandler() {
                firebase.auth().signOut()
            }

            function formChatSubmitHandler(e) {
                e.preventDefault()
                document.getElementById("form-chat-btn").setAttribute("disabled", true)

                let messageContent = formChat.message.value.trim()
                if (messageContent) {
                    controller.addMessage(messageContent)
                }
            }

            function formAddSubmitHandler(e) {
                e.preventDefault()
                let title = formAddConversation.title.value
                let friendEmail = formAddConversation.friendEmail.value
                let validateResult = [
                    view.validate(title, "title-error", "invalid title!"),
                    view.validate(
                        friendEmail && friendEmail != firebase.auth().currentUser.email,
                        "friend-email-error",
                        "Invalid friend email!"
                    )
                ]

                if(allPassed(validateResult)){
                    controller.addConversation(title,friendEmail)
                }
            }

            function leaveConversationHandler(){
                controller.leaveConversation()
            }

        

            break
        }
    }
}

view.setText = function (id, text) {
    document.getElementById(id).innerText = text
}

view.validate = function (condition, idErrortag, messageError) {
    if (condition) {
        view.setText(idErrortag, "")
        return true
    } else {
        view.setText(idErrortag, messageError)
        return false
    }
}

view.showCurrentConversation = function () {
    if (model.currentConversation) {
        //hien thi cac tin nhan
        let messages = model.currentConversation.messages
        let listMessage = document.getElementById("list-message")
        let currentEmail = firebase.auth().currentUser.email
        listMessage.innerHTML = ""


        for (let message of messages) {
            let className = ""
            if (message.owner == currentEmail) {
                className = "message-chat your"
            } else {
                className = "message-chat"
            }
            let html = `
           <div class="${className}">
               <span>${message.content}</span>
            </div>
        `

            listMessage.innerHTML += html
        }

        listMessage.scrollTop = listMessage.scrollHeight

        //show detail info
        let users = model.currentConversation.user
        let createdAt = model.currentConversation.createdAt
        let listUsers = document.getElementById("list-users")
        let createdAtDiv = document.getElementById("created-at")
        listUsers.innerHTML = ""

        for(let user of users){
            let html = `
            <div>${user}</div>
            `
            listUsers.innerHTML += html
        }
        console.log(createdAt)
        createdAtDiv.innerHTML = new Date(createdAt).toLocaleString()
    }
}

function allPassed(validateResult) {
    for (let result of validateResult) {
        if (!result) {
            return false
        }
    }
    return true
}

view.disable = function (id) {
    document.getElementById(id).setAttribute("disabled", true)
}

view.enable = function (id) {
    document.getElementById(id).removeAttribute("disabled")
}

view.showListConversation = function () {
    if (model.conversations) {
        //TODO: show all conversation in model.conversation t div id="list-conversation"
        let conversations = model.conversations
        let listConversation = document.getElementById("list-conversation")
        listConversation.innerHTML = ""

        for (let conversation of conversations) {
            let id = conversation.id
            let title = conversation.title
            let members = conversation.user.length
            let className = ""
            if (model.currentConversation && model.currentConversation.id == conversation.id) {
                className = "conversation current"
            } else {
                className = "conversation"
            }

            let html = `
               <div id="conversation-${id}" class="${className}">
                   <div class="conversation-title">${title}</div>
                   <div class="conversation-members">${members} members</div>
               </div>
            `

            listConversation.innerHTML += html
        }

        for (let conversation of conversations) {
            let id = conversation.id
            let conversationDiv = document.getElementById("conversation-" + id)

            conversationDiv.onclick = onClickHandler

            function onClickHandler() {
                model.saveCurrentConversation(conversation)
                view.showCurrentConversation()
                view.showListConversation()
            }
        }
    }
}

view.clearCurrentConversation = function() {
    let listMessages = document.getElementById("list-message")
    let listUsers = document.getElementById("list-users")
    let createdAt = document.getElementById("created-at")

    listMessages.innerHTML = ""
    listUsers.innerHTML = ""
    createdAt.innerHTML = ""
}