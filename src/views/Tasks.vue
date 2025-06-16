<template>
  <div class="tasks">
    <h2>Your Tasks</h2>

    <form @submit.prevent="addTask">
      <input v-model="newTask" placeholder="Enter task title" required />
      <button type="submit">Add Task</button>
    </form>

    <ul>
      <li v-for="task in tasks" :key="task.id">
        <span :class="{ done: task.completed }" @click="toggleTask(task)">
          {{ task.title }}
        </span>
        <button @click="deleteTask(task.id)">🗑</button>
        <input
          v-model="shareEmail"
          placeholder="Share to email"
          style="margin-right: 5px"
        />
        <button @click="shareTask(task)">📤 Share</button>
      </li>
    </ul>

    <label>Sort by: </label>
    <select v-model="sortBy" @change="sortTasks">
      <option value="createdAt">🕒 Created Time</option>
      <option value="dueDate">📅 Due Date</option>
      <option value="priority">⚠️ Priority</option>
    </select>

    <button @click="logout">Logout</button>
  </div>
</template>

<script>
import { db, auth } from "../firebase";
import firebase from "firebase/compat/app";

export default {
  name: "UserTasks",
  data() {
    return {
      newTask: "",
      tasks: [],
      user: null,
      sortBy: "createdAt",
      shareEmail: "",
    };
  },
  created() {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.user = user;
        await this.loadTasks(); // анх ачаалах үед load
      } else {
        this.$router.push("/login");
      }
    });
  },
  methods: {
    async loadTasks() {
      const tasks = [];

      // 1. Owner tasks
      let query = db.collection("tasks").where("userId", "==", this.user.uid);
      if (this.sortBy) {
        query = query.orderBy(this.sortBy);
      }

      const ownerSnapshot = await query.get();
      ownerSnapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() };
        const now = new Date();
        const due = task.dueDate?.toDate?.() || new Date();

        if (!task.completed && due - now < 24 * 60 * 60 * 1000) {
          this.$toasted.show(`Reminder: "${task.title}" is due soon!`, {
            duration: 4000,
            type: "info",
          });
        }

        tasks.push(task);
      });

      // 2. Shared tasks
      const sharedSnapshot = await db
        .collection("tasks")
        .where("sharedWith", "array-contains", this.user.email)
        .get();

      sharedSnapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() };
        tasks.push(task);
      });

      // 3. Set all tasks at once
      this.tasks = tasks;
    },

    async addTask() {
      if (!this.newTask.trim()) return;

      await db.collection("tasks").add({
        title: this.newTask.trim(),
        completed: false,
        userId: this.user.uid,
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 хоног
        priority: "medium",
        sharedWith: [],
      });

      this.newTask = "";
      await this.loadTasks();
    },
    async shareTask(task) {
      if (!this.shareEmail.trim()) {
        alert("Please enter an email to share with.");
        return;
      }

      const docRef = db.collection("tasks").doc(task.id);

      await docRef.update({
        sharedWith: firebase.firestore.FieldValue.arrayUnion(
          this.shareEmail.trim()
        ),
      });

      this.shareEmail = "";
      alert("Task shared successfully!");
    },

    async sortTasks() {
      await this.loadTasks();
    },
    async toggleTask(task) {
      await db.collection("tasks").doc(task.id).update({
        completed: !task.completed,
      });
      await this.loadTasks();
    },
    async deleteTask(taskId) {
      await db.collection("tasks").doc(taskId).delete();
      await this.loadTasks();
    },
    logout() {
    auth.signOut().then(() => {
    this.$router.push("/login").catch(err => {
      if (err.name !== "NavigationDuplicated") {
        throw err;
      }
    });
  });
    },
  },
};
</script>

<style scoped>
.tasks {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
}
form {
  display: flex;
  margin-bottom: 1rem;
}
input {
  flex: 1;
  margin-right: 0.5rem;
}
li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.done {
  text-decoration: line-through;
  color: gray;
  cursor: pointer;
}
</style>
