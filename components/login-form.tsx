type LoginFormProps = {
  password: string;
  setPassword: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
};

export function LoginForm({
  password,
  setPassword,
  onSubmit,
  error,
}: LoginFormProps) {
  return (
    <main className="app-shell">
      <form className="login" onSubmit={onSubmit}>
        <h1>Teams Alert Inbox</h1>
        <p className="subtitle">Enter app password to continue</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="App password"
          autoComplete="current-password"
        />
        <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
          Unlock
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}
