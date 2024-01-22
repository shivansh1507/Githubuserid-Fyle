const api = 'https://api.github.com/users/';
const accessToken = 'Generate your Accesstoken for local host';
const input = document.querySelector(".search-input");
const search = document.querySelector(".search-section i");
const reposPerPageInput = document.getElementById("reposPerPage");
let currentUsername = '';
let currentPage = 1;
let reposPerPage = 10;

function getData(data, page = 1) {
    console.log('Fetching data for:', data);

    currentUsername = data;

    fetch(`${api}${data}`, {
        headers: {
            Authorization: `token ${accessToken}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Username not found: ${data}`);
            }
            return response.json();
        })
        .then(userResponse => {
            console.log('User data:', userResponse);
            display(userResponse);

            fetch(`${api}${data}/repos?page=${page}&per_page=${reposPerPage}`, {
                headers: {
                    Authorization: `token ${accessToken}`
                }
            })
                .then(repoResponse => repoResponse.json())
                .then(repoData => {
                    console.log('Repositories data:', repoData);
                    displayRepos(repoData);
                    updatePagination(repoData.length);
                })
                .catch(err => {
                    console.error('Error fetching repositories:', err);
             
                });
        })
        .catch(err => {
            console.error('Error fetching user data:', err);
            handleUserNotFoundError();
        });
}

function handleUserNotFoundError() {
    document.querySelector(".github").style.display = "none";
    document.querySelector(".error").style.display = "block";
    document.querySelector(".error-message").innerText = `Username '${currentUsername}' not found.`;
}

function display(response) {
    if (response.message == 'Not Found') {
        document.querySelector(".github").style.display = "none";
        document.querySelector(".error").style.display = "block";
    } else {
        document.querySelector(".github").style.display = "grid";
        document.querySelector(".error").style.display = "none";
        input.value = '';

        document.querySelector(".profile-picture").src = response.avatar_url;
        document.querySelector(".name").innerHTML = response.name;
        document.querySelector(".login").innerHTML = response.login;
        document.querySelector(".bio").innerHTML = response.bio;

        document.querySelector(".repos-number").innerHTML = response.public_repos;
        document.querySelector(".follower-number").innerHTML = response.followers;
        document.querySelector(".following-number").innerHTML = response.following;

        const loc = document.querySelector(".location");
        const comp = document.querySelector(".company");

        response.location == null ? loc.innerHTML = 'Not Available' : loc.innerHTML = response.location;
        response.company == null ? comp.innerHTML = 'Not Available' : comp.innerHTML = response.company;

        const githubLink = generateGitHubLink(response.login);
        const githubLinkContainer = document.querySelector('.github-link');
        githubLinkContainer.innerHTML = ''; // Clear the previous GitHub link
        const githubLinkElement = document.createElement('a');
        githubLinkElement.href = githubLink;
        githubLinkElement.innerText = githubLink;
        githubLinkContainer.appendChild(githubLinkElement);
    }

    document.querySelector(".github").classList.remove("loading");

    const reposContainer = document.querySelector(".repositories");
    reposContainer.innerHTML = '';
}

function displayRepos(repos) {
    const reposContainer = document.querySelector(".repositories");

    reposContainer.innerHTML = '';

    repos.forEach(repo => {
        const repoElement = document.createElement("div");
        repoElement.classList.add("repo");

        const repoBoxElement = document.createElement("div");
        repoBoxElement.classList.add("repo-box");

        const repoNameElement = document.createElement("div");
        repoNameElement.classList.add("repo-name");
        repoNameElement.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;

        const repoDescriptionElement = document.createElement("div");
        repoDescriptionElement.classList.add("repo-description");
        repoDescriptionElement.innerHTML = `${repo.description || 'No description available'}`;

        const repoLanguageElement = document.createElement("div");
        repoLanguageElement.classList.add("repo-language");
        repoLanguageElement.innerHTML = `Language: ${repo.language || 'Not specified'}`;

        repoBoxElement.appendChild(repoNameElement);
        repoBoxElement.appendChild(repoDescriptionElement); 
        repoBoxElement.appendChild(repoLanguageElement);
        repoElement.appendChild(repoBoxElement);

        reposContainer.appendChild(repoElement);
    });

    const totalPages = Math.ceil(repos.length / reposPerPage);
    updatePagination(totalPages);
}

function updatePagination(totalPages) {
    const paginationContainer = document.querySelector(".page-numbers");
    paginationContainer.innerHTML = '';

    const prevArrow = createPaginationArrow("«", () => {
        if (currentPage > 1) {
            currentPage--;
            getData(currentUsername, currentPage);
        }
    });
    paginationContainer.appendChild(prevArrow);

    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = createPaginationNumber(i);
        paginationContainer.appendChild(pageNumber);
    }

    const nextArrow = createPaginationArrow("»", () => {
        if (currentPage < totalPages) {
            currentPage++;
            getData(currentUsername, currentPage);
        }
    });
    paginationContainer.appendChild(nextArrow);
}

function createPaginationNumber(page) {
    const pageNumber = document.createElement("span");
    pageNumber.textContent = page;
    pageNumber.addEventListener("click", () => {
        currentPage = page;
        getData(currentUsername, currentPage);
    });
    return pageNumber;
}

function createPaginationArrow(text, clickHandler) {
    const arrow = document.createElement("span");
    arrow.textContent = text;
    arrow.addEventListener("click", clickHandler);
    return arrow;
}

function loadProfile() {
    const username = input.value.trim();
    if (username !== "") {
        const githubLinkContainer = document.querySelector('.github-link');
        githubLinkContainer.innerHTML = ''; 

        const githubLink = generateGitHubLink(username);
        const githubLinkElement = document.createElement('a');
        githubLinkElement.href = githubLink;
        githubLinkElement.innerText = githubLink;
        githubLinkContainer.appendChild(githubLinkElement);

        getData(username);
    } else {
        alert("Please enter a valid GitHub Username.");
    }
}

search.addEventListener("click", loadProfile);

input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        loadProfile();
    }
});

reposPerPageInput.addEventListener("change", changeReposPerPage);

function changeReposPerPage() {
    const newReposPerPage = parseInt(reposPerPageInput.value, 10);

    if (!isNaN(newReposPerPage) && newReposPerPage > 0) {
        console.log('Changing repositories per page to:', newReposPerPage);
        reposPerPage = newReposPerPage;
        currentPage = 1;
        getData(currentUsername, currentPage);
    } else {
        alert("Please enter a valid number greater than 0 for repositories per page.");
    }
}

function generateGitHubLink(username) {
    return `https://github.com/${username}`;
}

loadProfile();
