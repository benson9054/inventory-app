import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "./firebase";

// ====== 樣式 ======
const styles = {
  container: { maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "Arial" },
  header: { textAlign: "center", marginBottom: "20px" },
  button: { padding: "10px", margin: "5px 0", width: "100%", border: "none", borderRadius: "5px", backgroundColor: "#1976d2", color: "white", cursor: "pointer" },
  backButton: { padding: "10px", marginTop: "20px", width: "100%", border: "none", borderRadius: "5px", backgroundColor: "#555", color: "white", cursor: "pointer" },
  itemCard: { display: "flex", justifyContent: "space-between", padding: "10px", margin: "5px 0", border: "1px solid #ccc", borderRadius: "5px", flexDirection: "column" },
  lowStock: { color: "red", fontWeight: "bold" },
  select: { padding: "8px", margin: "10px 0", borderRadius: "5px" },
  input: { display: "block", width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" },
};

const ResponsiveStyle = () => (
  <style>{`
    @media(min-width: 600px){
      .itemCard { flex-direction: row !important; align-items: center !important; }
    }
  `}</style>
);

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [items, setItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("全部");

  // 登入輸入欄位
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 即時監聽 Firestore items
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, "items"), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    });
    return () => unsub();
  }, []);

  const categories = ["全部", ...Array.from(new Set(items.map(i => i.category)))];

  // 手動登入
  const login = async () => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(cred.user);

      const userRef = doc(db, "users", cred.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setRole(userData.role);
      } else {
        alert("找不到對應的使用者角色資料");
      }

      setPage("home");
    } catch (err) {
      alert("登入失敗: " + err.message);
    }
  };

  // 扣庫存
  const deductStock = async (itemId) => {
    const itemRef = doc(db, "items", itemId);
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const newStock = Math.max(item.stock - 1, 0);
    await updateDoc(itemRef, { stock: newStock });
  };

  // 呼叫後端 Firebase Function 發送 LINE
  const sendLineMessage = async (item) => {
    try {
      await fetch("https://你的後端域名/send-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${item.name} 庫存不足，請叫貨 ${item.safety * 2 - item.stock} ${item.unit}`,
          userId: "廠商LINEID或群組ID"
        })
      });
      alert(`${item.name} 已通知廠商`);
    } catch (err) {
      console.error(err);
      alert("發送失敗");
    }
  };

  const filteredItems = categoryFilter === "全部" ? items : items.filter(i => i.category === categoryFilter);
  const lowStockItems = items.filter(i => i.stock <= i.safety);

  // ====== 畫面 ======
  if (page === "login") {
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>登入餐廳系統</h2>
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={styles.button} onClick={login}>登入</button>
      </div>
    );
  }

  // ====== 主頁 ======
  return (
    <div style={styles.container}>
      <ResponsiveStyle />
      <h1 style={styles.header}>餐廳庫存管理系統</h1>

      {page === "home" && (
        <div>
          <h3>登入角色：{role}</h3>
          <button style={styles.button} onClick={() => setPage("deduct")}>📦 扣庫存</button>
          <button style={styles.button} onClick={() => setPage("inventory")}>📊 查看庫存</button>
          {role === "manager" && <button style={styles.button} onClick={() => setPage("order")}>📝 叫貨清單</button>}
          <button style={styles.backButton} onClick={() => setPage("login")}>登出</button>
        </div>
      )}

      {page === "deduct" && (
        <>
          <h2>扣庫存</h2>
          <label>
            分類篩選：
            <select style={styles.select} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          {filteredItems.map(item => (
            <div key={item.id} className="itemCard" style={styles.itemCard}>
              <div>{item.name} - 剩 {item.stock} {item.unit} {item.stock <= item.safety && <span style={styles.lowStock}>⚠ 低庫存</span>}</div>
              <button style={styles.button} onClick={() => deductStock(item.id)}>扣 1 {item.unit}</button>
            </div>
          ))}
          <button style={styles.backButton} onClick={() => setPage("home")}>回首頁</button>
        </>
      )}

      {page === "inventory" && (
  <>
    <h2>庫存狀況</h2>
    <label>
      分類篩選：
      <select style={styles.select} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </label>
    {filteredItems.map(item => (
      <div key={item.id} className="itemCard" style={styles.itemCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <span>{item.name} - </span>
          {role === "manager" ? (
            <>
              <input
                type="number"
                value={item.stock}
                min={0}
                style={{ width: "60px", marginRight: "10px" }}
                onChange={async (e) => {
                  const newStock = Number(e.target.value);
                  const itemRef = doc(db, "items", item.id);
                  await updateDoc(itemRef, { stock: newStock });
                }}
              />
              <span>{item.unit}</span>
            </>
          ) : (
            <span>{item.stock} {item.unit}</span>
          )}
          {item.stock <= item.safety && <span style={styles.lowStock}> ⚠ 低庫存</span>}
        </div>
        {role !== "manager" && (
          <button style={styles.button} onClick={() => deductStock(item.id)}>扣 1 {item.unit}</button>
        )}
      </div>
    ))}
    <button style={styles.backButton} onClick={() => setPage("home")}>回首頁</button>
  </>
)}

      {page === "order" && role === "manager" && (
  <>
    <h2>叫貨清單</h2>
    {lowStockItems.map(item => (
      <div key={item.id} className="itemCard" style={styles.itemCard}>
        <div>
          {item.name} - 現存 {item.stock} {item.unit} / 安全庫存 {item.safety} {item.unit}
        </div>
        <button style={styles.button} onClick={() => sendLineMessage(item)}>📤 發送 LINE</button>
      </div>
    ))}
    <button style={styles.backButton} onClick={() => setPage("home")}>回首頁</button>
  </>
)}
    </div>
  );
}

export default App;