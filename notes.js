
document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');
    });

    // Subject Toggle
    const toggleSubjectBtn = document.getElementById('toggleSubjectBtn');
    const noteSubject = document.getElementById('noteSubject');
    const newSubjectInput = document.getElementById('newSubjectInput');

    toggleSubjectBtn.addEventListener('click', () => {
        noteSubject.classList.toggle('hidden');
        newSubjectInput.classList.toggle('hidden');
        toggleSubjectBtn.textContent = noteSubject.classList.contains('hidden') ? 'Select' : '+';
    });

    // Notes CRUD Operations
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    const notesContainer = document.getElementById('notesContainer');
    const subjectFilter = document.getElementById('subjectFilter');
    const searchInput = document.getElementById('searchInput');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
    const noteModal = document.getElementById('noteModal');
    const deleteModal = document.getElementById('deleteModal');

    // Initialize the app
    function init() {
        renderNotes();
        updateSubjectFilter();
    }

    // Render all notes
    function renderNotes(filteredNotes = null) {
        notesContainer.innerHTML = '';
        const notesToRender = filteredNotes || notes;
        
        if (notesToRender.length === 0) {
            document.querySelector('.empty-state').classList.add('flex');
            document.querySelector('.empty-state').classList.remove('hidden');
            return;
        }

        document.querySelector('.empty-state').classList.remove('flex');
        document.querySelector('.empty-state').classList.add('hidden');

        notesToRender.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg';
            noteCard.innerHTML = `
                <div class="p-5">
                    <div class="flex justify-between items-start mb-2">
                        <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full ${getSubjectColor(note.subject)}">${note.subject}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${note.title}</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">${stripHtml(note.content).substring(0, 150)}${stripHtml(note.content).length > 150 ? '...' : ''}</p>
                    <div class="flex justify-end space-x-2">
                        <button class="edit-note-btn px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200" data-id="${note.id}">
                            Edit
                        </button>
                        <button class="delete-note-btn px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200" data-id="${note.id}">
                            Delete
                        </button>
                    </div>
                </div>
            `;
            notesContainer.appendChild(noteCard);
        });

        // Add event listeners to the new buttons
        document.querySelectorAll('.edit-note-btn').forEach(btn => {
            btn.addEventListener('click', handleEditNote);
        });

        document.querySelectorAll('.delete-note-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteNote);
        });
    }

    // Get color for subject badge
    function getSubjectColor(subject) {
        const colors = {
            'Mathematics': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
            'Science': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'History': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
            'Literature': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
            'Programming': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
        };

        return colors[subject] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }

    // Strip HTML tags for preview
    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    // Update subject filter dropdown
    function updateSubjectFilter() {
        // Clear existing options except "All Subjects"
        while (subjectFilter.options.length > 1) {
            subjectFilter.remove(1);
        }

        // Get unique subjects from notes
        const subjects = [...new Set(notes.map(note => note.subject))];
        
        // Add subjects to filter
        subjects.sort().forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectFilter.appendChild(option);
        });
    }

    // Handle add note
    addNoteBtn.addEventListener('click', openAddNoteModal);
    emptyStateAddBtn.addEventListener('click', openAddNoteModal);

    function openAddNoteModal() {
        document.getElementById('modalTitle').textContent = 'Add New Note';
        document.getElementById('noteId').value = '';
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteContent').innerHTML = '';
        document.getElementById('noteSubject').value = '';
        document.getElementById('newSubjectInput').value = '';
        document.getElementById('newSubjectInput').classList.add('hidden');
        document.getElementById('noteSubject').classList.remove('hidden');
        toggleSubjectBtn.textContent = '+';
        noteModal.classList.remove('hidden');
    }

    // Handle edit note
    function handleEditNote(e) {
        const noteId = e.target.getAttribute('data-id');
        const note = notes.find(note => note.id === noteId);

        if (note) {
            document.getElementById('modalTitle').textContent = 'Edit Note';
            document.getElementById('noteId').value = note.id;
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteContent').innerHTML = note.content;
            document.getElementById('noteSubject').value = note.subject;
            document.getElementById('newSubjectInput').value = '';
            document.getElementById('newSubjectInput').classList.add('hidden');
            document.getElementById('noteSubject').classList.remove('hidden');
            toggleSubjectBtn.textContent = '+';
            noteModal.classList.remove('hidden');
        }
    }

    // Handle save note
    document.getElementById('saveBtn').addEventListener('click', saveNote);

    function saveNote() {
        const noteId = document.getElementById('noteId').value;
        let subject = document.getElementById('noteSubject').value;
        const newSubject = document.getElementById('newSubjectInput').value.trim();
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').innerHTML.trim();

        // If new subject was entered, use it
        if (newSubjectInput.classList.contains('hidden') === false && newSubject) {
            subject = newSubject;
        }

        if (!subject || !title || !content) {
            alert('Please fill all fields');
            return;
        }

        if (noteId) {
            // Update existing note
            const noteIndex = notes.findIndex(note => note.id === noteId);
            if (noteIndex !== -1) {
                notes[noteIndex] = {
                    ...notes[noteIndex],
                    subject,
                    title,
                    content,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Add new note
            const newNote = {
                id: generateId(),
                subject,
                title,
                content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            notes.unshift(newNote);
        }

        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
        updateSubjectFilter();
        noteModal.classList.add('hidden');
    }

    // Generate ID for new note
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Handle delete note
    function handleDeleteNote(e) {
        const noteId = e.target.getAttribute('data-id');
        document.getElementById('deleteNoteId').value = noteId;
        deleteModal.classList.remove('hidden');
    }

    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        const noteId = document.getElementById('deleteNoteId').value;
        notes = notes.filter(note => note.id !== noteId);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
        updateSubjectFilter();
        deleteModal.classList.add('hidden');
    });

    // Cancel delete
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });

    // Close modals
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        noteModal.classList.add('hidden');
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        noteModal.classList.add('hidden');
    });

    // Filter notes by subject
    subjectFilter.addEventListener('change', filterNotes);

    // Search notes
    searchInput.addEventListener('input', filterNotes);

    function filterNotes() {
        const selectedSubject = subjectFilter.value;
        const searchTerm = searchInput.value.toLowerCase();

        let filteredNotes = [...notes];

        if (selectedSubject) {
            filteredNotes = filteredNotes.filter(note => note.subject === selectedSubject);
        }

        if (searchTerm) {
            filteredNotes = filteredNotes.filter(note => 
                note.title.toLowerCase().includes(searchTerm) || 
                stripHtml(note.content).toLowerCase().includes(searchTerm)
            );
        }

        renderNotes(filteredNotes);
    }

    // Initialize the app
    init();
});
  