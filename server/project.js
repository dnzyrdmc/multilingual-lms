export default function ({
  db,
  router,
  run,
  get,
  all,
  text,
  choice,
  required,
}) {
  db.exec(`CREATE TABLE IF NOT EXISTS courses(id TEXT PRIMARY KEY);CREATE TABLE IF NOT EXISTS lessons(id TEXT PRIMARY KEY,course TEXT REFERENCES courses(id),position INTEGER);
 CREATE TABLE IF NOT EXISTS translations(entity TEXT,locale TEXT,title TEXT,body TEXT,PRIMARY KEY(entity,locale));CREATE TABLE IF NOT EXISTS progress(owner TEXT REFERENCES users(id),lesson TEXT REFERENCES lessons(id),completed INTEGER,PRIMARY KEY(owner,lesson));`);
  run("INSERT OR IGNORE INTO courses VALUES('web')");
  for (const row of [
    [
      "web",
      "tr",
      "Web Geliştirme",
      "Üç kısa dersle istemci, sunucu ve veri ilişkisi.",
    ],
    [
      "web",
      "en",
      "Web Development",
      "Three short lessons about clients, servers and data.",
    ],
    [
      "l1",
      "tr",
      "HTTP ve API",
      "İstemci bir istek gönderir; sunucu durum kodu ve içerik döndürür. 200 başarı, 404 bulunamadı anlamına gelir.",
    ],
    [
      "l1",
      "en",
      "HTTP and APIs",
      "The client sends a request. The server returns a status code and a response body.",
    ],
    [
      "l2",
      "tr",
      "Vue Bileşenleri",
      "Bileşenler görünümü küçük parçalara ayırır. Props veri alır; events üst bileşene değişiklik bildirir.",
    ],
    [
      "l2",
      "en",
      "Vue Components",
      "Components split the interface into reusable parts. Props carry input and events signal changes.",
    ],
    [
      "l3",
      "tr",
      "Veri Bütünlüğü",
      "UNIQUE tekrarları engeller. Foreign key tablolar arasındaki ilişkinin geçerliliğini korur.",
    ],
  ])
    run("INSERT OR IGNORE INTO translations VALUES(?,?,?,?)", ...row);
  for (let i = 1; i <= 3; i++)
    run("INSERT OR IGNORE INTO lessons VALUES(?,?,?)", "l" + i, "web", i);
  router.get("/courses", (req, res) => {
    const locale = choice(req.query.locale || "tr", ["tr", "en"]);
    const tr = (e) =>
      get(
        "SELECT * FROM translations WHERE entity=? AND locale=?",
        e,
        locale,
      ) || get("SELECT * FROM translations WHERE entity=? AND locale='tr'", e);
    res.json(
      all("SELECT * FROM courses").map((c) => ({
        ...c,
        ...tr(c.id),
        lessons: all(
          "SELECT * FROM lessons WHERE course=? ORDER BY position",
          c.id,
        ).map((l) => ({
          ...l,
          ...tr(l.id),
          completed: !!get(
            "SELECT completed FROM progress WHERE owner=? AND lesson=?",
            req.user.id,
            l.id,
          )?.completed,
        })),
      })),
    );
  });
  router.put("/progress/:lesson", (req, res) => {
    required(get("SELECT id FROM lessons WHERE id=?", req.params.lesson));
    run(
      "INSERT INTO progress VALUES(?,?,?) ON CONFLICT(owner,lesson) DO UPDATE SET completed=excluded.completed",
      req.user.id,
      req.params.lesson,
      req.body.completed === true ? 1 : 0,
    );
    res.json({ ok: true });
  });
}
