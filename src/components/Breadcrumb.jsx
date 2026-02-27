function Breadcrumb({ items }) {
  return (
    <div style={{ fontSize: "14px" }}>
      {items.map((item, index) => (
        <span key={index}>
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            item.label
          )}
          {index < items.length - 1 && " / "}
        </span>
      ))}
    </div>
  );
}

export default Breadcrumb;
