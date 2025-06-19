<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>Edit Task</h3>
      <input v-model="editableTask.title" placeholder="Title" />
      <textarea v-model="editableTask.description" placeholder="Description" rows="3"></textarea>
      <input type="date" v-model="editableTask.dueDateFormatted" />

      <div v-if="editableTask.userId === currentUserId">
        <label>Share with (emails):</label>
        <div class="share-input">
          <input
            v-model="sharedUser"
            placeholder="Enter email"
          />
          <button class="share-btn" @click="addSharedUser">Share</button>
        </div>

        <ul class="shared-users">
          <li v-for="(user, index) in editableTask.sharedWith" :key="index">
            {{ user }}
            <button @click="removeSharedUser(index)">×</button>
          </li>
        </ul>
      </div>

      <div v-else class="shared-info">
        <strong>Shared from:</strong> {{ task.userEmail }}
      </div>

      <p><strong>Created:</strong> {{ formatDate(task.createdAt) }}</p>

      <div class="modal-actions">
        <button @click="$emit('save', editableTask)">Save</button>
        <button @click="$emit('delete', task.id)">Delete</button>
        <button @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "../firebase";

export default {
  name: "TaskModal",
  props: {
    task: {
      type: Object,
      required: true,
    },
    currentUserId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      editableTask: { ...this.task, sharedWith: this.task.sharedWith || [] },
      sharedUser: "",
    };
  },
  methods: {
    formatDate(date) {
      const d = date instanceof Date ? date : new Date(date.seconds * 1000);
      return d.toLocaleString();
    },
    async addSharedUser() {
      const email = this.sharedUser.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        email &&
        emailRegex.test(email) &&
        !this.editableTask.sharedWith.includes(email)
      ) {
        this.editableTask.sharedWith.push(email);
        this.sharedUser = "";

        try {
          await db.collection("tasks").doc(this.editableTask.id).update({
            sharedWith: this.editableTask.sharedWith,
          });
        } catch (err) {
          console.error("Failed to share task:", err);
        }
      }
    },
    removeSharedUser(index) {
      this.editableTask.sharedWith.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-content input,
.modal-content textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 1rem;
}

.share-input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.share-input input {
  flex: 1;
}

.share-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.share-btn:hover {
  background: #2563eb;
}

.shared-users {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.shared-users li {
  background: #e2e8f0;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shared-users button {
  background: none;
  border: none;
  color: #ef4444;
  font-weight: bold;
  cursor: pointer;
}

.shared-info {
  font-size: 0.9rem;
  color: #4b5563;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-actions button {
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.modal-actions button:nth-child(1) {
  background: #10b981;
  color: white;
}
.modal-actions button:nth-child(2) {
  background: #ef4444;
  color: white;
}
.modal-actions button:nth-child(3) {
  background: #e5e7eb;
  color: #374151;
}
</style>