<script setup>
import { ref, onMounted, computed } from "vue";
import { api, act } from "./api";
const courses = ref([]),
  locale = ref("tr"),
  selected = ref(null);
async function load() {
  courses.value = await api("/courses?locale=" + locale.value);
  if (selected.value) {
    selected.value = courses.value
      .flatMap((c) => c.lessons)
      .find((l) => l.id === selected.value.id);
  }
}
const percent = (c) =>
  Math.round(
    (c.lessons.filter((l) => l.completed).length / c.lessons.length) * 100,
  );
onMounted(() => act(load, ""));
</script>
<template>
  <div class="toolbar">
    <label
      >Dil / Language<select v-model="locale" @change="act(load, '')">
        <option value="tr">Türkçe</option>
        <option value="en">English</option>
      </select></label
    >
  </div>
  <div class="grid">
    <section class="panel" v-for="c in courses">
      <h2>{{ c.title }}</h2>
      <p>{{ c.body }}</p>
      <strong
        >{{ percent(c) }}%
        {{ locale === "tr" ? "tamamlandı" : "complete" }}</strong
      >
      <div class="bar"><i :style="{ width: percent(c) + '%' }"></i></div>
      <div v-for="l in c.lessons" class="card">
        <button class="ghost" @click="selected = l">
          {{ l.position }}. {{ l.title }}</button
        ><span class="badge">{{ l.completed ? "✓" : "○" }}</span
        ><small v-if="l.locale !== locale"
          >Çeviri yok; Türkçe içerik gösteriliyor.</small
        >
      </div>
    </section>
    <section class="panel">
      <template v-if="selected"
        ><h2>{{ selected.title }}</h2>
        <article class="markdown">{{ selected.body }}</article>
        <button
          style="margin-top: 24px"
          @click="
            act(async () => {
              await api('/progress/' + selected.id, 'PUT', {
                completed: !selected.completed,
              });
              await load();
            })
          "
        >
          {{
            selected.completed
              ? locale === "tr"
                ? "Tamamlanmadı olarak işaretle"
                : "Mark incomplete"
              : locale === "tr"
                ? "Dersi tamamla"
                : "Complete lesson"
          }}
        </button></template
      >
      <p v-else class="empty">
        {{ locale === "tr" ? "Bir ders seç." : "Select a lesson." }}
      </p>
    </section>
  </div>
</template>
