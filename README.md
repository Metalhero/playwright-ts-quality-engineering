# Playwright TypeScript Quality Engineering

A projekt két külön futtatható példát tartalmaz. A Playwright és TypeScript tesztek a nyilvános TodoMVC demót és a projekt futtatási beállításait ellenőrzik. A k6 terhelési teszt a Docker Compose-ban futó helyi minta API-t méri, az eredményeket pedig a Prometheus tárolja és a Grafana jeleníti meg.

## Playwright és minőségellenőrzés

A parancsokat a repó gyökérkönyvtárából futtasd. Használj Node.js 24-et és npm-et, a lint workflow is ezt a Node.js főverziót használja. A TodoMVC böngészőtesztjeihez el kell érni a `https://demo.playwright.dev` címet, vagy a `TEST_BASE_URL` változóban megadott TodoMVC példányt.

```bash
npm ci --ignore-scripts
npx playwright install chromium
npm run verify
```

Linuxon a Chromium rendszerfüggőségeit is telepítheted a `npx playwright install --with-deps chromium` paranccsal.

A `verify` sorrendben futtatja a telepítést is ellenőrző `doctor` parancsot, az ESLintet, a TypeScript típusellenőrzést, valamint a Chromium és API teszteket.

| Parancs | Feladat |
| --- | --- |
| `npm run doctor -- --check-install` | Projektfájlok és a Playwright csomag ellenőrzése |
| `npm run lint` | ESLint futtatása, figyelmeztetés esetén is hibakóddal |
| `npm run lint:check-fix` | Az automatikus lintjavítások előnézete JSON-ban |
| `npm run lint:fix` | Az automatikus lintjavítások alkalmazása |
| `npm run typecheck` | TypeScript típusellenőrzés fájlok generálása nélkül |
| `npm test` | A Chromium és API projektek tesztjeinek futtatása |
| `npm test -- --project=api` | Csak az API-tesztek futtatása |
| `npm run test:ui` | A Playwright interaktív tesztfelülete |
| `npx playwright show-report` | A HTML tesztjelentés megnyitása |
| `npx playwright show-trace <trace.zip útvonala>` | Egy mentett trace megnyitása |

A [TodoMVC tesztek](tests/todo.spec.ts) a feladatok állapotát, a befejezett feladatok szűrését és törlését ellenőrzik. Külön tesztek fedik le a [futtatási konfigurációt](tests/runtime-config.spec.ts) és a [doctor parancsot](tests/doctor.spec.ts). A Playwright konzolos és HTML riportot készít, hiba esetén pedig megtartja a trace-t és képernyőképet ment.

A `tests/api` mappában lévő tesztek a külön `api` projektben futnak. A JSONPlaceholder alapcíme (`https://jsonplaceholder.typicode.com`) a `playwright.config.ts` fájlban, az API-projekt `use.baseURL` beállításában szerepel, így a kérések relatív útvonalakat használhatnak, például `request.get('/posts/1')`. Ezekhez a tesztekhez hálózati hozzáférés szükséges, böngésző nem.

| Környezeti változó | Beállítás |
| --- | --- |
| `TEST_BASE_URL` | HTTP vagy HTTPS alapcím. Alapértelmezésben `https://demo.playwright.dev`. |
| `PW_TEST_TIMEOUT_MS` | Tesztenkénti időkorlát pozitív egész ezredmásodpercben. Alapértelmezésben 30 000 ms. |
| `PW_WORKERS` | Lokális workerek száma pozitív egész számként. Megadás nélkül a Playwright alapbeállítása érvényes. |

Helyben a Chromium ablakban fut, újrapróbálkozás nélkül. A `CI=true` beállítás mellett ablak nélkül fut, egy workerrel és egy újrapróbálkozással. A CI a `test.only` használatát hibának tekinti.

## Helyi terhelési teszt Docker Compose-zal

Indítsd el a Docker Desktopot, és várd meg, amíg a Docker motor elérhető. A `docker compose version` paranccsal ellenőrizheted a Compose elérhetőségét. A k6 a saját konténerében fut.

A repó gyökeréből indítsd el a minta API-t, a Prometheust és a Grafanát.

```bash
docker compose -f compose.performance.yml up -d target prometheus grafana
docker compose -f compose.performance.yml ps
```

A helyi API a Compose-hálózaton, a `http://target:8080` címen érhető el. A `GET /health` végpont az API állapotát jelzi. A [k6 forgatókönyv](performance/load.js) a `GET /api/todos` végponton HTTP 200 választ és pontosan két elemet tartalmazó JSON-tömböt vár.

Ha a szolgáltatások elindultak, futtasd a forgatókönyvet Prometheus-kimenettel.

```bash
docker compose -f compose.performance.yml run --rm k6 run -o experimental-prometheus-rw /scripts/load.js
```

A `run` a megnevezett k6 szolgáltatáshoz automatikusan aktiválja a `loadtest` profilt, a `--rm` pedig a futás végén eltávolítja az egyszeri k6-konténert. A terhelési szakaszok 10 másodperc alatt 5 virtuális felhasználóra emelik a terhelést, 20 másodpercig tartják, majd 10 másodperc alatt nullára csökkentik.

| k6 küszöb | Elvárt érték |
| --- | --- |
| HTTP-kérések hibaaránya | 1% alatt |
| HTTP-válaszidő 95. percentilise | 500 ms alatt |
| Sikeres ellenőrzések aránya | 99% felett |

A k6 2.4.0 az `experimental-prometheus-rw` kimenet használatakor elavulási figyelmeztetést ír, miközben a kimenet tovább működik. A k6 v3-ra tervezik az eltávolítását. A Compose a `grafana/k6:2.4.0` képet használja. A helyi verziót a `docker compose -f compose.performance.yml run --rm --no-deps k6 version` paranccsal ellenőrizheted. [k6 2.4.0 kiadási megjegyzések](https://github.com/grafana/k6/releases/tag/v2.4.0#deprecations)

### Prometheus és Grafana dashboard

- A Prometheus felülete a [http://localhost:9090](http://localhost:9090) címen érhető el. Saját metrikáit 5 másodpercenként gyűjti. A k6 a `http://prometheus:9090/api/v1/write` végpontra küldi a `k6_` kezdetű metrikákat.
- A Grafana felülete a [http://localhost:3000](http://localhost:3000) címen érhető el. A Compose első indításkor beállított helyi belépési adatai `admin` / `localdevonly`.

A repóban lévő [Grafana-adatforrásminta](monitoring/grafanaData.yml) a `monitoring` gyökerében van. A Compose a `monitoring/grafana/provisioning` mappát csatolja, ezért a feltöltött minta alapján kézzel állítsd be az adatforrást és hozd létre a dashboardot.

1. A Grafanában nyisd meg a **Connections → Data sources** menüt, adj hozzá egy **Prometheus** adatforrást, és a szerver címének add meg a `http://prometheus:9090` értéket. Kattints a **Save & test** gombra.
2. A **Dashboards → New → New dashboard** menüben adj hozzá egy **Time series** panelt, és válaszd ki a Prometheus adatforrást.
3. A kérésforgalom nézetéhez írd be a `sum(rate(k6_http_reqs_total[1m]))` PromQL-lekérdezést, majd mentsd el a dashboardot. Az időtartomány fedje le a k6 futását. Friss példa esetén futtasd újra a terhelést a panel megnyitása után.

### Leállítás az adatok megtartásával

A konténerek ideiglenes leállításához, majd ugyanazok újraindításához használd a `stop` és `start` parancsot.

```bash
docker compose -f compose.performance.yml stop
docker compose -f compose.performance.yml start
```

A konténerek és a Compose-hálózat eltávolításához használd a `down` parancsot.

```bash
docker compose -f compose.performance.yml down
```

A `down` így megőrzi a `prometheus-data` és a `grafana-data` kötetet. Ha ugyanabból a projektkönyvtárból ismét az `up -d target prometheus grafana` paranccsal indítasz, a szolgáltatások visszakapják a tárolt metrikákat és a mentett Grafana-beállításokat. Az adatok megőrzéséhez hagyd el a `--volumes` (`-v`) kapcsolót.
