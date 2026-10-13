// A parallax layer. `depth` controls how far it drifts while scrolling.
export default function Par({ depth = 0.1, className = '', style, children }) {
  return (
    <div className={`par ${className}`} data-depth={depth} style={style}>
      {children}
    </div>
  );
}
