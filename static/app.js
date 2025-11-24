document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.remove("hidden-on-load");
});


const burger = document.querySelector(".burger");
const nav = document.querySelector("nav");


// ##############################
function editPost(post_pk, currentText) {
    const postDiv = document.getElementById(`post_${post_pk}`);
    postDiv.innerHTML = `
        <textarea id="edit_text_${post_pk}">${currentText}</textarea>
        <button onclick="savePost('${post_pk}')">Save</button>
        <button onclick="cancelEdit('${post_pk}', '${currentText.replace(/'/g,"\\'")}')">Cancel</button>
    `;
}

// ##############################
async function savePost(post_pk) {
    const postDiv = document.getElementById(`post_${post_pk}`);
    const newText = document.getElementById(`edit_text_${post_pk}`).value;

    console.log("Saving post:", post_pk, newText);

    // Update the DOM immediately for instant feedback
    if (postDiv) {
        postDiv.innerHTML = `
            <p class="text">${newText}</p>
            <button onclick="editPost('${post_pk}', \`${newText}\`)">Edit</button>
            <button onclick="deletePost('${post_pk}')">Delete</button>
        `;
    }

    // Send the update to the server
    try {
        const response = await fetch(`/api-update-post/${post_pk}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_message: newText })
        });

        const result = await response.json();
        if (!result.success) {
            console.error("Server failed to update post:", result.error);
            alert("Failed to save post on server.");
            // Optional: revert to previous text if server fails
        } else {
            console.log("Post successfully updated on server");
        }
    } catch (err) {
        console.error("Error saving post on server:", err);
        alert("Error connecting to server.");
        // Optional: revert to previous text if server fails
    }
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
    console.log("Delete clicked", post_pk);
    if (!confirm("Are you sure you want to delete this post?")) return;
    const postDiv = document.getElementById(`post_${post_pk}`);
    if (postDiv) postDiv.remove();
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


