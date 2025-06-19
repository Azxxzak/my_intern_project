<template>
  <div class="task-wrapper">
    <div class="task-box">
      <h2 class="task-title">📋 Kanban Board</h2>

      <!-- Sorting -->
      <div class="task-sort">
        <label for="sort">Sort by:</label>
        <select v-model="sortOption" @change="sortTasks" id="sort">
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      <!-- Task submission form -->
      <form @submit.prevent="addTask" class="task-form">
        <input v-model="newTask" placeholder="New task title" required />
        <textarea
          v-model="newDescription"
          placeholder="Task description"
          required
        ></textarea>
        <input type="date" v-model="newDueDate" required />
        <select v-model="newPriority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select v-model="newStatus">
          <option value="Open">To Do</option>
          <option value="InProgress">In Progress</option>
          <option value="Testing">Testing</option>
          <option value="Close">Done</option>
        </select>
        <button type="submit">Add</button>
      </form>

      <!-- Syncfusion Kanban board -->
      <ejs-kanban
        id="kanban"
        keyField="Status"
        :dataSource="tasks"
        :cardSettings="cardSettings"
        :swimlaneSettings="{ keyField: 'userEmail' }"
        @cardClick="handleCardClick"
        @dragStop="onCardDrop"
        class="kanban-board"
      >
        <e-columns>
          <e-column headerText="To Do" keyField="Open"></e-column>
          <e-column headerText="In Progress" keyField="InProgress"></e-column>
          <e-column headerText="Testing" keyField="Testing"></e-column>
          <e-column headerText="Done" keyField="Close"></e-column>
        </e-columns>
      </ejs-kanban>

      <button class="logout-btn" @click="logout">Logout</button>

      <!-- Modal Component -->
      <TaskModal
        v-if="selectedTask"
        :task="selectedTask"
        :current-user-id="user.uid"
        @save="updateTask"
        @delete="deleteTask"
        @close="selectedTask = null"
      />
    </div>
  </div>
</template>

<script>
import {
  KanbanComponent,
  ColumnDirective,
  ColumnsDirective,
} from "@syncfusion/ej2-vue-kanban";
import { auth, db } from "../firebase";
import TaskModal from "@/components/TaskModal.vue";

export default {
  name: "UserTasks",
  components: {
    TaskModal,
    "ejs-kanban": KanbanComponent,
    "e-columns": ColumnsDirective,
    "e-column": ColumnDirective,
  },
  data() {
    return {
      user: null,
      newTask: "",
      newDescription: "",
      newDueDate: new Date().toISOString().split("T")[0],
      newPriority: "medium",
      newStatus: "Open",
      sortOption: "dueDate",
      tasks: [],
      selectedTask: null,
      cardSettings: {
        contentField: "title",
        headerField: "id",
        tagsField: "priority",
        showHeader: true,
        template: `
          <div class="custom-card \${priority}">
            <div class="card-title">\${title}</div>
            <div class="card-tags">
              <span class="tag \${priority}">\${priority}</span>
            </div>
            <div class="card-footer">
              <span class="footer-user">\${userEmail}</span>
              <span class="footer-date">\${new Date(dueDate.seconds * 1000).toLocaleDateString()}</span>
            </div>
          </div>
        `,
      },
    };
  },
  created() {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.user = user;
        await this.loadTasks();
        this.checkReminders();
      } else {
        this.$router.push("/login");
      }
    });
  },
  methods: {
    async loadTasks() {
      const taskMap = {};
      const ownerSnapshot = await db
        .collection("tasks")
        .where("userId", "==", this.user.uid)
        .get();
      ownerSnapshot.forEach((doc) => {
        const data = doc.data();
        taskMap[doc.id] = {
          id: doc.id,
          ...data,
          userEmail: this.user.email,
          dueDateFormatted: new Date(data.dueDate.seconds * 1000)
            .toISOString()
            .split("T")[0],
        };
      });
      const sharedSnapshot = await db
        .collection("tasks")
        .where("sharedWith", "array-contains", this.user.email)
        .get();
      sharedSnapshot.forEach((doc) => {
        const data = doc.data();
        taskMap[doc.id] = {
          id: doc.id,
          ...data,
          userEmail: data.userEmail,
          dueDateFormatted: new Date(data.dueDate.seconds * 1000)
            .toISOString()
            .split("T")[0],
        };
      });
      this.tasks = Object.values(taskMap);
      this.sortTasks();
    },
    async addTask() {
      if (!this.newTask.trim()) return;
      await db.collection("tasks").add({
        title: this.newTask.trim(),
        description: this.newDescription.trim(),
        priority: this.newPriority,
        Status: this.newStatus,
        completed: false,
        userId: this.user.uid,
        userEmail: this.user.email,
        createdAt: new Date(),
        dueDate: new Date(this.newDueDate),
        sharedWith: [],
      });
      this.newTask = "";
      this.newDescription = "";
      this.newPriority = "medium";
      this.newDueDate = new Date().toISOString().split("T")[0];
      await this.loadTasks();
    },
    handleCardClick(args) {
      this.selectedTask = {
        ...args.data,
        dueDateFormatted: new Date(args.data.dueDate.seconds * 1000)
          .toISOString()
          .split("T")[0],
      };
    },
    async deleteTask(id) {
      if (!id) return;
      try {
        await db.collection("tasks").doc(id).delete();
        this.selectedTask = null;
        await this.loadTasks();
      } catch (error) {
        console.error("🗑️ Failed to delete task:", error);
      }
    },
    async updateTask(task) {
      const {
        id,
        title,
        description,
        Status,
        dueDateFormatted,
        sharedWith = [],
      } = task;

      if (!id || typeof Status === "undefined") return;

      try {
        await db
          .collection("tasks")
          .doc(id)
          .update({
            title: title || "",
            description: description || "",
            Status,
            dueDate: new Date(dueDateFormatted),
            sharedWith,
          });

        this.selectedTask = null;
        await this.loadTasks();
      } catch (error) {
        console.error("🔥 Failed to update task:", error);
      }
    },
    async onCardDrop(args) {
      const card = args.data?.[0];
      const docId = card?.id;
      const newStatus = args.dropKey || card?.Status;
      if (!docId || typeof newStatus === "undefined") return;
      try {
        await db.collection("tasks").doc(docId).update({ Status: newStatus });
        await this.loadTasks();
      } catch (error) {
        console.error("Failed to update task status:", error);
      }
    },
    sortTasks() {
      if (this.sortOption === "dueDate") {
        this.tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      } else if (this.sortOption === "priority") {
        const levels = { high: 1, medium: 2, low: 3 };
        this.tasks.sort((a, b) => levels[a.priority] - levels[b.priority]);
      }
    },
    checkReminders() {
      const now = new Date();
      this.tasks.forEach((task) => {
        const dueDate = new Date(task.dueDate.seconds * 1000);
        if (dueDate <= now && task.Status !== "Close") {
          this.$toasted.show(
            `Reminder: Task "${task.title}" is due or overdue!`,
            { type: "info" }
          );
        }
      });
    },
    logout() {
      auth.signOut().then(() => {
        this.$router.push("/login").catch((err) => {
          if (err.name !== "NavigationDuplicated") {
            console.error("Router error:", err);
          }
        });
      });
    },
  },
};
</script>

<style scoped>
.task-wrapper {
  display: flex;
  justify-content: center;
  padding: 2rem;
  min-height: 100vh;
  background: #f1f5f9;
}
.task-box {
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  max-width: 1280px;
  width: 100%;
}
.task-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  margin-bottom: 1.5rem;
}
.task-sort {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}
.task-sort label {
  margin-right: 0.5rem;
  font-weight: 500;
}
.task-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}
.task-form input,
.task-form textarea,
.task-form select {
  flex: 1 1 240px;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
  background: #f8fafc;
  transition: border-color 0.3s;
}
.task-form input:focus,
.task-form textarea:focus,
.task-form select:focus {
  outline: none;
  border-color: #3b82f6;
}
.task-form button {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.task-form button:hover {
  background: #2563eb;
}
.logout-btn {
  margin-top: 2rem;
  width: 100%;
  padding: 0.75rem;
  background: #ef4444;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.kanban-board {
  margin-top: 2rem;
}

/* Kanban Cards */
::v-deep .custom-card {
  padding: 1rem;
  border-radius: 12px;
  background-color: #f1f5f9;
  border-left: 5px solid #e2e8f0;
}
::v-deep .custom-card.high {
  border-left-color: #dc2626;
}
::v-deep .custom-card.medium {
  border-left-color: #f59e0b;
}
::v-deep .custom-card.low {
  border-left-color: #10b981;
}
::v-deep .card-title {
  font-size: 1rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 0.5rem;
}
::v-deep .card-tags .tag {
  display: inline-block;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 5px;
  padding: 2px 6px;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}
::v-deep .card-footer {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  justify-content: space-between;
}
::v-deep .e-swimlane-header {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  gap: 0.5rem;
}

::v-deep .e-kanban-table {
  width: 100%;
}
::v-deep .e-item-count {
  font-size: 1rem;
  color: #6b7280;
}
::v-deep .e-swimlane-text {
  display: flex;
  align-items: center;
  justify-content: center;
}
textarea {
  max-height: 32px;
  min-height: 26px;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-content {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.modal-content input,
.modal-content textarea {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f9fafb;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
}
.modal-actions button {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.modal-actions button:nth-child(1) {
  background: #22c55e;
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
