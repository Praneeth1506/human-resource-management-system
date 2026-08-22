function ResetPassword() {
  return (
    <div>
      <h1>First Login</h1>
      <h2>Reset Your Password</h2>

      <form>
        <div>
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
          />
        </div>

        <br />

        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
          />
        </div>

        <br />

        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;