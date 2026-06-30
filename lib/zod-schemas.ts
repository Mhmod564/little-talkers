import { z } from "zod";

// Validate every Server Action input on the server (see .claude/plan.md §1).

export const LoginRequestSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "اسم المستخدم قصير جدًا")
    .max(50, "اسم المستخدم طويل جدًا"),
  // Login keeps the lenient rule so existing accounts still work; the strict
  // policy below only applies when a password is *created or changed*.
  password: z.string().min(6, "كلمة المرور قصيرة جدًا").max(200),
  // which login tab was selected, so the server can reject cross-role logins
  role: z.enum(["therapist", "parent"]).optional(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Shared password policy for *setting* a password: 8–10 characters, with at
// least one capital letter, one number, and one dash (-).
export const PASSWORD_RULE_MSG =
  "كلمة المرور يجب أن تكون من 8 إلى 10 خانات وتحتوي على حرف كبير ورقم وشرطة (-).";
export const PasswordSchema = z
  .string()
  .min(8, PASSWORD_RULE_MSG)
  .max(10, PASSWORD_RULE_MSG)
  .regex(/[A-Z]/, PASSWORD_RULE_MSG)
  .regex(/[0-9]/, PASSWORD_RULE_MSG)
  .regex(/-/, PASSWORD_RULE_MSG);
/** Same rule, but an empty string means "leave the password unchanged". */
export const OptionalPasswordSchema = z
  .union([PasswordSchema, z.literal("")])
  .optional();

export const VerifyCodeSchema = z.object({
  challengeId: z.string().uuid(),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "الرمز يجب أن يكون 6 أرقام"),
});
export type VerifyCode = z.infer<typeof VerifyCodeSchema>;

// ---- Patients ----------------------------------------------------------

const PatientBase = z.object({
  name: z.string().trim().min(1),
  age: z.coerce.number().int().min(1).max(18),
  gender: z.enum(["male", "female"]),
  birthDate: z.string().min(1),
  therapistId: z.string().uuid(),
  guardian: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  diagnosis: z.string().trim().min(1),
  // auto-generated server-side (parent<N>); never user-editable
  parentUsername: z.string().trim().optional(),
});

export const CreatePatientSchema = PatientBase.extend({
  parentEmail: z.string().email(),
  parentPassword: PasswordSchema,
});
export type CreatePatient = z.infer<typeof CreatePatientSchema>;

export const UpdatePatientSchema = PatientBase.extend({
  id: z.string().uuid(),
  parentEmail: z.union([z.string().email(), z.literal("")]).optional(),
  parentPassword: OptionalPasswordSchema,
});
export type UpdatePatient = z.infer<typeof UpdatePatientSchema>;

// ---- Clinical ----------------------------------------------------------

export const NoteSchema = z.object({
  patientId: z.string().uuid(),
  date: z.string().min(1),
  text: z.string().trim().min(1),
});

export const ProgressSchema = z.object({
  patientId: z.string().uuid(),
  progress: z.coerce.number().int().min(0).max(100),
});

export const PlanSchema = z.object({
  patientId: z.string().uuid(),
  plan: z.string().trim().max(5000),
});

export const SessionSchema = z.object({
  patientId: z.string().uuid(),
  date: z.string().min(1),
  time: z.string().optional().default(""),
  title: z.string().trim().optional().default(""),
});

export const SessionUpdateSchema = SessionSchema.extend({
  id: z.string().uuid(),
});

export const SummarySchema = z.object({
  patientId: z.string().uuid(),
  id: z.string().uuid(),
  summary: z.string().trim().min(1),
});

export const RecordingSchema = z.object({
  patientId: z.string().uuid(),
  title: z.string().trim().optional().default(""),
  date: z.string().min(1),
  url: z.string().url(),
});

export const IdRefSchema = z.object({
  patientId: z.string().uuid(),
  id: z.string().uuid(),
});

// ---- Doctors / access control -----------------------------------------

const DoctorBase = z.object({
  name: z.string().trim().min(1),
  title: z.string().trim().optional().default(""),
  // auto-generated server-side (therapist<N>); never user-editable
  username: z.string().trim().optional(),
});

export const CreateDoctorSchema = DoctorBase.extend({
  email: z.string().email(),
  password: PasswordSchema,
});
export type CreateDoctor = z.infer<typeof CreateDoctorSchema>;

export const UpdateDoctorSchema = DoctorBase.extend({
  id: z.string().uuid(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  password: OptionalPasswordSchema,
});
export type UpdateDoctor = z.infer<typeof UpdateDoctorSchema>;

// ---- Chat --------------------------------------------------------------

export const SendMessageSchema = z.object({
  patientId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});
