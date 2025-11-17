export type FormState = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: "contributor" | "attempter" | "admin";
};

export const initialFormState: FormState = {
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  role: "attempter",
};

export const validateRegistrationForm = (
  form: FormState
): Partial<FormState> => {
  const errors: Partial<FormState> = {};

  if (!form.email) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Invalid email";
  }

  if (!form.username) {
    errors.username = "Username is required";
  }

  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};
