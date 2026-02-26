import { useState } from "react";

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
  },
  header: { textAlign: "center", marginBottom: "20px" },
  button: {
    margin: "5px 0",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#1976d2",
    color: "white",
    width: "100%",
  },
  backButton: {
    marginTop: "20px",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#555",
    color: "white",
    width: "100%",
  },
  itemCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "10px",
    margin: "5px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  lowStock: { color: "red", fontWeight: "bold" },
  filter: { marginBottom: "10px", padding: "5px", borderRadius: "5px" },
};

// Media query for larger screens (inline styles can't do media queries directly)
// We will use CSS in a style tag
const ResponsiveStyle = () => (
  <style>
    {`
      @media(min-width: 600px) {
        .itemCard {
          flex-direction: row !important;
          align-items: center !important;
        }
        .button {
          width: auto !important;
        }
        .backButton {
          width: auto !important;
        }
      }
    `}
  </style>
);

function App() {
  const [page, setPage] = useState("home");
  const [filter, setFilter] = useState("全部");
  const [items, setItems] = useState([
    { id: 1, name: "牛奶", stock: 3, safety: 2, unit: "罐", category: "飲料" },
    { id: 2, name: "雞塊", stock: 1, safety: 2, unit: "箱", category: "食材" },
    { id: 3, name: "杯子", stock: 5, safety: 3, unit: "條", category: "包材" },
    { id: 4, name: "洗碗精", stock: 2, safety: 2, unit: "瓶", category: "清潔" },
  ]);

  const deductStock = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, stock: item.stock - 1 } : item
    ));
  };

  const filteredItems = items.filter(item => filter === "全部" || item.category === filter);

  return (
    <div style={styles.container}>
      <ResponsiveStyle />
      <h1 style={styles.header}>餐廳庫存管理系統</h1>

      {page === "home" && (
        <div style={{ textAlign: "center" }}>
          <button className="button" style={styles.button} onClick={() => setPage("deduct")}>📦 扣庫存</button>
          <button className="button" style={styles.button} onClick={() => setPage("inventory")}>📊 查看庫存</button>
          <button className="button" style={styles.button} onClick={() => setPage("order")}>📝 叫貨清單</button>
        </div>
      )}

      {page === "deduct" && (
        <>
          <h2>扣庫存</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filter}
          >
            <option value="全部">全部分類</option>
            <option value="食材">食材</option>
            <option value="飲料">飲料</option>
            <option value="包材">包材</option>
            <option value="清潔">清潔</option>
          </select>

          {filteredItems.map(item => (
            <div key={item.id} className="itemCard" style={styles.itemCard}>
              <div>
                {item.name}（剩 {item.stock} {item.unit}）
                {item.stock <= item.safety && <span style={styles.lowStock}> ⚠ 低庫存</span>}
              </div>
              <button className="button" style={styles.button} onClick={() => deductStock(item.id)}>
                開一{item.unit}
              </button>
            </div>
          ))}
          <button className="backButton" style={styles.backButton} onClick={() => setPage("home")}>回首頁</button>
        </>
      )}

      {page === "inventory" && (
        <>
          <h2>庫存狀況</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filter}
          >
            <option value="全部">全部分類</option>
            <option value="食材">食材</option>
            <option value="飲料">飲料</option>
            <option value="包材">包材</option>
            <option value="清潔">清潔</option>
          </select>

          {filteredItems.map(item => (
            <div key={item.id} className="itemCard" style={styles.itemCard}>
              <div>{item.name} - {item.stock} {item.unit}</div>
              {item.stock <= item.safety && <div style={styles.lowStock}>⚠ 低庫存</div>}
            </div>
          ))}
          <button className="backButton" style={styles.backButton} onClick={() => setPage("home")}>回首頁</button>
        </>
      )}

      {page === "order" && (
        <>
          <h2>叫貨清單</h2>
          {items
            .filter(item => item.stock <= item.safety)
            .map(item => (
              <div key={item.id} className="itemCard" style={styles.itemCard}>
                <div>{item.name} - 建議叫 {item.safety * 2 - item.stock} {item.unit}</div>
              </div>
            ))}
          <button className="backButton" style={styles.backButton} onClick={() => setPage("home")}>回首頁</button>
        </>
      )}
    </div>
  );
}

export default App;