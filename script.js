
const photoGrid = document.getElementById("photoGrid");
const searchInput = document.querySelector(".search-box input, input[type='search']");
const selectionBar = document.getElementById("selectionBar");
const selectedCount = document.getElementById("selectedCount");

const photos = [
    {
        name: "Mountain Escape",
        category: "Travel",
        date: "October 12, 2026",
        size: "2.4 MB",
        favorite: true,
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600"
    },
    {
        name: "Peaceful Lake",
        category: "Travel",
        date: "October 10, 2026",
        size: "1.8 MB",
        favorite: false,
        image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600"
    },
    {
        name: "Nature Walk",
        category: "Nature",
        date: "October 8, 2026",
        size: "3.1 MB",
        favorite: true,
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600"
    },
    {
        name: "Ocean Memories",
        category: "Travel",
        date: "October 6, 2026",
        size: "2.7 MB",
        favorite: false,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"
    },
    {
        name: "Spring Flowers",
        category: "Nature",
        date: "October 4, 2026",
        size: "1.5 MB",
        favorite: true,
        image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600"
    },
    {
        name: "Golden Sunrise",
        category: "Screenshots",
        date: "October 2, 2026",
        size: "900 KB",
        favorite: false,
        image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600"
    }
];

let currentFilter = "Photos";
let selectedPhotos = new Set();

function openModal(content) {
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modalContent");

    if (!modal || !modalContent) {
        alert("Modal elements are missing from index.html");
        return;
    }

    modalContent.innerHTML = content;
    modal.classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal")?.classList.add("hidden");
}


function renderPhotos() {
    if (!photoGrid) return;

    const searchText = searchInput?.value.toLowerCase().trim() || "";

    const filteredPhotos = photos.filter(photo => {
        const matchesSearch =
            photo.name.toLowerCase().includes(searchText) ||
            photo.category.toLowerCase().includes(searchText);

        let matchesFilter = true;

        if (currentFilter === "Favorites") {
            matchesFilter = photo.favorite;
        } else if (currentFilter === "Travel") {
            matchesFilter = photo.category === "Travel";
        } else if (currentFilter === "Screenshots") {
            matchesFilter = photo.category === "Screenshots";
        } else if (currentFilter === "People") {
            matchesFilter = false;
        } else if (currentFilter === "AI suggested albums") {
            matchesFilter = photo.favorite || photo.category === "Travel";
        }

        return matchesSearch && matchesFilter;
    });

    photoGrid.innerHTML = "";

    if (filteredPhotos.length === 0) {
        photoGrid.innerHTML = `
            <p class="empty-message">
                No photos found here. Try another section or search.
            </p>`;
        updateSelectionBar();
        return;
    }

    filteredPhotos.forEach(photo => {
        const card = document.createElement("div");
        card.className = "photo-card";
        card.dataset.photoName = photo.name;

        if (selectedPhotos.has(photo.name)) {
            card.classList.add("selected");
        }

        card.innerHTML = `
            <div class="photo-image-wrap">
                <img src="${photo.image}" alt="${photo.name}" loading="lazy">
                <button class="select-photo" type="button" aria-label="Select photo">
                    ${selectedPhotos.has(photo.name) ? "✓" : "○"}
                </button>
                <button class="favorite-photo" type="button" aria-label="Toggle favorite">
                    ${photo.favorite ? "♥" : "♡"}
                </button>
            </div>
            <div class="photo-info">
                <strong>${photo.name}</strong>
                <span>${photo.date} · ${photo.size}</span>
            </div>
        `;

        card.querySelector(".select-photo").addEventListener("click", () => {
            if (selectedPhotos.has(photo.name)) {
                selectedPhotos.delete(photo.name);
            } else {
                selectedPhotos.add(photo.name);
            }
            renderPhotos();
        });

        card.querySelector(".favorite-photo").addEventListener("click", () => {
            photo.favorite = !photo.favorite;
            renderPhotos();
        });

        card.querySelector("img").addEventListener("click", () => {
            showPhotoDetails(photo);
        });

        photoGrid.appendChild(card);
    });

    updateSelectionBar();
}

function updateSelectionBar() {
    if (selectedCount) {
        selectedCount.textContent = selectedPhotos.size;
    }

    if (selectionBar) {
        selectionBar.classList.toggle("hidden", selectedPhotos.size === 0);
    }
}


function showPhotoDetails(photo) {
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modalContent");

    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
        <div class="photo-detail-view">
            <img
                src="${photo.image}"
                alt="${photo.name}"
                class="detail-photo"
            >

            <div class="detail-title-row">
                <div>
                    <h2>${photo.name}</h2>
                    <p>${photo.date}</p>
                </div>

                <button id="detailFavorite" class="detail-action"
                    title="Toggle favorite">
                    ${photo.favorite ? "♥" : "♡"}
                </button>

                <button id="detailShare" class="detail-action"
                    title="Share photo">↗</button>
            </div>

            <div class="detail-info">
                <h3>Photo information</h3>
                <div><span>Category</span><strong>${photo.category}</strong></div>
                <div><span>File size</span><strong>${photo.size}</strong></div>
                <div><span>Added</span><strong>${photo.date}</strong></div>
            </div>

            <p class="demo-note">
                Photo details shown by your AI Photos demo.
            </p>
        </div>
    `;

    modal.classList.remove("hidden");

    document.getElementById("detailFavorite").onclick = () => {
        photo.favorite = !photo.favorite;
        showPhotoDetails(photo);
        renderPhotos();
    };

    document.getElementById("detailShare").onclick = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: photo.name,
                    text: `${photo.name} — ${photo.date}`,
                    url: photo.image
                });
            } else {
                await navigator.clipboard.writeText(photo.image);
                alert("Photo link copied!");
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                alert("Sharing isn't available in this browser.");
            }
        }
    };
}


function setPage(title) {
    currentFilter = title;

    const heading = document.querySelector("main h1, .main-content h1");
    if (heading) heading.textContent = title;

    renderPhotos();
}

// Make sidebar buttons work by their visible labels.

document.querySelectorAll(".side-item").forEach(button => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        const label = button.textContent.toLowerCase();

        // Visually highlight the clicked sidebar item.
        document.querySelectorAll(".side-item").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        // Show the correct section.
        if (filter === "all" || label.includes("photos")) {
            setPage("Photos");
        } else if (filter === "favorites" || label.includes("favorite")) {
            setPage("Favorites");
        } else if (filter === "travel" || label.includes("travel")) {
            setPage("Travel");
        } else if (filter === "people" || label.includes("people")) {
            setPage("People");
        } else if (filter === "screenshots" || label.includes("screenshot")) {
            setPage("Screenshots");
        } else if (label.includes("suggested") || label.includes("albums")) {
    openOrganizeAlbum();
}
    });
});


// Search photos.
if (searchInput) {
    searchInput.addEventListener("input", renderPhotos);
}

// Clear selected photos.
document.getElementById("clearBtn")?.addEventListener("click", () => {
    selectedPhotos.clear();
    renderPhotos();
});

// Review selected photos.
document.getElementById("reviewBtn")?.addEventListener("click", () => {
    const selected = photos.filter(photo => selectedPhotos.has(photo.name));

    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modalContent");

    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
        <h2>Selected Photos</h2>
        ${selected.map(photo => `<p>${photo.name} — ${photo.size}</p>`).join("")}
        <p>Total selected: ${selected.length}</p>
    `;

    modal.classList.remove("hidden");
});

// Close the details modal.
document.getElementById("closeModal")?.addEventListener("click", () => {
    document.getElementById("modal")?.classList.add("hidden");
});

// AI chat popup.
const aiChatWindow = document.getElementById("aiChatWindow");
const chatForm = document.getElementById("chatForm");
const chatMessages = document.getElementById("chatMessages");
const userMessage = document.getElementById("userMessage");

function openAIChat() {
    if (!aiChatWindow) {
        alert("The AI chat window is missing from index.html.");
        return;
    }

    aiChatWindow.classList.remove("hidden");
    userMessage?.focus();
}

document.getElementById("aiBtn")?.addEventListener("click", openAIChat);

function openOrganizeAlbum() {
    // Show the first four sample photos.
    const albumPhotos = photos.slice(0, 4);

    // Select all four by default.
    albumPhotos.forEach(photo => selectedPhotos.add(photo.name));

    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modalContent");

    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
        <h2>✨ AI Suggested Album</h2>
        <p>Weekend Memories</p>
        <p>Select the photos you want to keep in this album.</p>

        <div class="organize-album-grid">
            ${albumPhotos.map(photo => `
                <label class="organize-photo">
                    <img src="${photo.image}" alt="${photo.name}">
                    <div class="organize-photo-info">
                        <input type="checkbox"
                            class="album-photo-check"
                            data-name="${photo.name}"
                            checked>
                        <span>${photo.name}</span>
                    </div>
                </label>
            `).join("")}
        </div>

        <div class="organize-album-footer">
            <span id="albumSelectedCount">${albumPhotos.length} selected</span>
            <button id="saveAlbumBtn" class="blue-button">
                Done
            </button>
        </div>
    `;

    modal.classList.remove("hidden");

    const checkboxes = [
        ...modalContent.querySelectorAll(".album-photo-check")
    ];

    function updateAlbumSelection() {
        checkboxes.forEach(checkbox => {
            const name = checkbox.dataset.name;

            if (checkbox.checked) {
                selectedPhotos.add(name);
            } else {
                selectedPhotos.delete(name);
            }
        });

        document.getElementById("albumSelectedCount").textContent =
            `${checkboxes.filter(box => box.checked).length} selected`;

        updateSelectionBar();
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", updateAlbumSelection);
    });

    document.getElementById("saveAlbumBtn").onclick = () => {
        updateAlbumSelection();
        closeModal();
        renderPhotos();
    };

    updateAlbumSelection();
}

document.getElementById("organizeBtn")
    ?.addEventListener("click", openOrganizeAlbum);
document.getElementById("closeChatBtn")?.addEventListener("click", () => {
    aiChatWindow?.classList.add("hidden");
});

chatForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const message = userMessage?.value.trim();
    if (!message || !chatMessages) return;

    addMessage(message, "user-message");
    userMessage.value = "";

    const thinking = addMessage("Thinking...", "ai-message");

    try {
        const response = await fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "AI request failed");
        }

        thinking.textContent = data.reply || data.answer || "No answer received.";
    } catch (error) {
        console.error(error);
        thinking.textContent =
            "I couldn't connect to the AI server. Your photo filters still work.";
    }
});

function addMessage(text, className) {
    const element = document.createElement("div");
    element.className = className;
    element.textContent = text;
    chatMessages.appendChild(element);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return element;
}

// Load the sample photos when the page opens.
renderPhotos();


document.getElementById("helpBtn").addEventListener("click", () => {
    openModal(`
        <h2>Help & Support</h2>
        <p>📸 Organize photos into albums.</p>
        <p>✨ Ask AI for photo organization and storage advice.</p>
        <p>☁ Review your storage usage.</p>
    `);
});

document.getElementById("settingsBtn").addEventListener("click", () => {
    openModal(`
        <h2>Settings</h2>
        <label>
            <input type="checkbox" id="confirmSetting" checked>
            Ask before transferring photos
        </label>
        <p>Changes apply to this demo only.</p>
        <button onclick="closeModal()">Save & Close</button>
    `);
});


document.getElementById("profileBtn")?.addEventListener("click", () => {
    openModal(`
        <div class="profile-page">
            <div class="profile-top">
                <div class="profile-avatar-large">N</div>
                <h2>Naila</h2>
                <p>naila@example.com</p>
                <span class="profile-badge">Photos AI User</span>
            </div>

            <hr>

            <h3>Your account</h3>

            <div class="profile-option">
                <span>👤</span>
                <div>
                    <strong>Personal information</strong>
                    <p>Manage your profile details</p>
                </div>
            </div>

            <div class="profile-option">
                <span>☁️</span>
                <div>
                    <strong>Storage</strong>
                    <p>14.2 GB of 15 GB used</p>
                </div>
            </div>

            <div class="profile-option">
                <span>✨</span>
                <div>
                    <strong>AI preferences</strong>
                    <p>Manage your photo organization preferences</p>
                </div>
            </div>

            <div class="profile-option">
                <span>🔒</span>
                <div>
                    <strong>Privacy</strong>
                    <p>Your demo account is not connected to Google.</p>
                </div>
            </div>

            <button id="profileDoneBtn" class="blue-button">
                Done
            </button>
        </div>
    `);

    document.getElementById("profileDoneBtn").onclick = closeModal;
});



function showStoragePlans() {
    openModal(`
        <h2>☁️ Manage Your Storage</h2>
        <p>You have used 14.2 GB of 15 GB.</p>
        
<div class="storage-meter">
    <div class="storage-meter-fill"></div>
</div>
<p class="storage-caption">94.7% used · Only 0.8 GB remaining</p>


        <hr>

        <h3>Option 1: Free up space</h3>
        <p>Review photos and screenshots you no longer need.</p>
        <button id="reviewStorageBtn">Review Photos</button>

        <hr>

        <h3>Option 2: Get more storage</h3>
        <p>Check available Google One plans and offers.</p>
        <button id="viewPlansBtn">View Plans</button>
    `);

    document.getElementById("reviewStorageBtn").onclick = () => {
        closeModal();
        document.getElementById("organizeBtn").click();
    };

    document.getElementById("viewPlansBtn").onclick = () => {
        window.open(
            "https://one.google.com/about/plans",
            "_blank",
            "noopener"
        );
    };
}


document.getElementById("plansBtn")
    .addEventListener("click", showStoragePlans);

document.getElementById("sidebarPlans")
    .addEventListener("click", showStoragePlans);

document.getElementById("selectAllBtn")?.addEventListener("click", () => {
    const visibleCards = [
        ...document.querySelectorAll("#photoGrid .photo-card")
    ];

    if (visibleCards.length === 0) return;

    const allSelected = visibleCards.every(card =>
        selectedPhotos.has(card.dataset.photoName)
    );

    visibleCards.forEach(card => {
        const name = card.dataset.photoName;

        if (allSelected) {
            selectedPhotos.delete(name);
        } else {
            selectedPhotos.add(name);
        }
    });

    renderPhotos();

    const button = document.getElementById("selectAllBtn");
    if (button) {
        button.textContent = allSelected ? "Select all" : "Deselect all";
    }
});
