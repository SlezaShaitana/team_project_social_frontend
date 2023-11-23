// import router from "@/router";
// import store from "@/store";

export default {
  install(app, options) {
    let socket;
    const socketApi = {
      connect() {
        const serverUrl = 'ws://' + options.server + '/api/v1/streaming/ws';
        console.log(serverUrl);
        socket = new WebSocket(serverUrl);
        console.log('function connect');
        socket.onopen = () => {
          console.log('Websocket connected...');
          // const connectObject = {
          //   token,
          //   type: 'Connect',
          //   text: 'Hello, server!',
          // };
          // let connectMessage = JSON.stringify(connectObject);
          // socket.send(token);
        };

        socket.onmessage = (event) => {
          let serverMessage = {
            type: 'none'
          };
          let msg = event.data;
          // let msg = JSON.stringify(event.data);

          try {
            serverMessage = JSON.parse(msg);
            //somthing strange, it throws error but parses to json
            console.log(serverMessage);
          } catch (e) {
            console.log({ e });
          }
          //  { type: "online", status: true, userId: "" }
          // real time online decision
          // if (serverMessage.type === "ONLINE") {
          //   const currentRoute = router.history.current;
          //   // console.log(router.history.current);
          //   const routeName = currentRoute.name;
          //   console.log(serverMessage.userId, currentRoute.params.id);
          //   if (
          //     routeName === "ProfileId" &&
          //     serverMessage.userId === currentRoute.params.id
          //   ) {
          //     // update profile online status profileId
          //     let newInfo = {};
          //     let userInfo = store.getters["users/info/getUsersInfo"];
          //     console.log(userInfo, userInfo.is_onlined, serverMessage.status);
          //     if (userInfo && userInfo.id) {
          //       newInfo = Object.assign({}, userInfo, {
          //         is_onlined: serverMessage.status,
          //       });
          //       console.log(newInfo, store.commit);
          //       store.commit("users/info/setUsersInfo", newInfo);
          //     }
          //
          //     // console.log(store.getters["users/info/getInfo"]);
          //   }
          //   if (routeName === "Im") {
          //     console.log("update profile online status in messages");
          //   }
          // }
        };

        socket.onerror = (e) => {
          // Сервер недоступен
          console.log('connect error!!', {
            e
          });
          return;
        };

        socket.onclose = (e) => {
          // Сервер недоступен
          console.log(`[close] Соединение закрыто чисто, код = ${e.code} причина = ${e.reason}`, {
            e
          });
          return;
        };
      },

      sendMessage(payload) {
        const message = JSON.stringify(payload);
        console.log(message);
        socket.send(message);
      },

      subscribe(eventType, callback) {
        console.log(eventType);

        socket.onmessage = (event) => {
          let serverMessage = null;
          let msg = event.data;
          try {
            serverMessage = JSON.parse(msg);
            console.log('Сработал в файле websocket.js')
            console.log(serverMessage);
          } catch (e) {
            console.log(e);
          }
          callback(serverMessage); // вызываем переданную колбэк функцию и передаем ей полученное сообщение
        };
      },
    }
    app.config.globalProperties.$socket = socketApi;
  },
};