const burger = document.querySelector(".burger");
const nav = document.querySelector("nav");

// ##############################
function editPost(post_pk, currentText) {
    const postDiv = document.getElementById(`post_${post_pk}`);
    postDiv.innerHTML = `
        <textarea id="edit_text_${post_pk}">${currentText}</textarea>
        <button onclick="savePost('${post_pk}')">Save</button>
        <button onclick="cancelEdit('${post_pk}', \`${currentText}\`)">Cancel</button>
    `;
}

// ##############################
function savePost(post_pk) {
    const postDiv = document.getElementById(`post_${post_pk}`);
    const newText = document.getElementById(`edit_text_${post_pk}`).value;
    const formData = new FormData();
    formData.append("post", newText);

    fetch(`/api-update-post/${post_pk}`, { method: "POST", body: formData })
        .then(res => {
            if (!res.ok) throw new Error("Error updating post");
            return res.text();
        })
        .then(html => {
            if (postDiv) postDiv.outerHTML = html;
        })
        .catch(err => console.error(err));
}

// ##############################
function cancelEdit(post_pk, originalText) {
    const postDiv = document.getElementById(`post_${post_pk}`);
    if (postDiv) {
        postDiv.innerHTML = `
            <p class="text">${originalText}</p>
            <button onclick="editPost('${post_pk}', \`${originalText}\`)">Edit</button>
            <button onclick="deletePost('${post_pk}')">Delete</button>
        `;
    }
}

// ##############################
function deletePost(post_pk) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    fetch(`/api-delete-post/${post_pk}`, { method: "POST" })
        .then(res => {
            if (!res.ok) throw new Error("Error deleting post");
            const postDiv = document.getElementById(`post_${post_pk}`);
            if (postDiv) postDiv.remove();
        })
        .catch(err => console.error(err));
}

// ##############################
async function server(url, method, data_source_selector, function_after_fetch) {
    let conn = null;
    if (method.toUpperCase() === "POST") {
        const data_source = document.querySelector(data_source_selector);
        conn = await fetch(url, {
            method: method,
            body: new FormData(data_source)
        });
    }
    if (!conn) return console.log("error connecting to the server");
    const data_from_server = await conn.text();
    window[function_after_fetch](data_from_server);
}

// ##############################
function get_search_results(url, method, data_source_selector, function_after_fetch) {
    const txt_search_for = document.querySelector("#txt_search_for");
    if (txt_search_for.value === "") {
        console.log("empty search");
        document.querySelector("#search_results").innerHTML = "";
        document.querySelector("#search_results").classList.add("d-none");
        return false;
    }
    server(url, method, data_source_selector, function_after_fetch);
}

// ##############################
function parse_search_results(data_from_server) {
    data_from_server = JSON.parse(data_from_server);
    let users = "";
    data_from_server.forEach(user => {
        let user_avatar_path = user.user_avatar_path ? user.user_avatar_path : "unknown.jpg";
        let html = `
        <div class="d-flex a-items-center">
            <img src="${user_avatar_path}" class="w-8 h-8 rounded-full" alt="Profile Picture">
            <div class="w-full ml-2">
                <p>
                    ${user.user_first_name} ${user.user_last_name}
                    <span class="text-c-gray:+20 text-70">@${user.user_username}</span>
                </p>
            </div>
            <button class="px-4 py-1 text-c-white bg-c-black rounded-lg">Follow</button>
        </div>`;
        users += html;
    });
    document.querySelector("#search_results").innerHTML = users;
    document.querySelector("#search_results").classList.remove("d-none");
}

// ##############################
burger.addEventListener("click", () => {
    nav.classList.toggle("active");
    burger.classList.toggle("open");
});
