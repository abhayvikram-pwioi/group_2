const appState = {

    currentUser: {},
    current_Tab: "overview",

};

function getData(data, user_number) {

    appState.currentUser =
        data.members[user_number];

    console.log(appState);
}
