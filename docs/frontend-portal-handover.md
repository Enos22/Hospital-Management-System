# Frontend portal integration handover

This note is the integration contract for portal owners consuming the shared
frontend components. It describes the current component APIs and the conventions
to preserve when wiring portal routes.

## Provider setup

`src/main.jsx` should wrap the application once in `AppProviders`. The provider
order is intentional:

1. `QueryClientProvider` owns the shared TanStack Query cache.
2. `AuthProvider` exposes the signed-in user and clears cached account data when
   the session changes.
3. `ToastProvider` renders the global React Hot Toast host.

Keep the single `QueryClient` in `src/app/providers.jsx`; do not create one per
page. Feature hooks require this provider. `useAuth()` and `useToast()` must be
called below `AppProviders`.

```jsx
import AppProviders from "./app/providers.jsx";
import App from "./app/App.jsx";

root.render(
  <AppProviders>
    <App />
  </AppProviders>,
);
```

`AppProviders` is already wired in `src/main.jsx`. Do not add a second nested
provider in a portal or page.

## Toast usage

Use the shared `useToast` hook for mutation outcomes and actionable failures.
Do not mount another `Toaster` in individual pages.

```jsx
import { useToast } from "../components/feedback/ToastProvider.jsx";

function SaveAction() {
  const toast = useToast();

  async function save() {
    try {
      await saveRecord();
      toast.success("Changes saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save changes.");
    }
  }

  return <button type="button" onClick={save}>Save</button>;
}
```

`useToast()` returns `success(message)`, `error(message)`, and `dismiss(id)`.
Keep field validation errors inline; reserve toasts for operation-level feedback.

## Layout conventions

- Wrap authenticated portal route elements in `PortalLayout`; it renders the
  role-derived desktop sidebar, topbar, page `<main>`, mobile navigation, and
  nested `<Outlet />`. It also accepts `children` for a non-route composition.
- Put page content in a `<section className="page-content">` and start it with
  `PageHeader` for a consistent title/description/actions row.
- `Sidebar` and `MobileNavigation` accept optional `items`; by default they use
  `roleNavItems[role]`. Keep desktop and mobile menus on the same item list.
- The sidebar is hidden and the fixed, horizontally scrollable mobile menu is
  shown at widths of 900px and below. At 600px and below, page spacing and
  headers compact. Avoid fixed-width portal content that creates horizontal
  overflow.
- Use semantic headings, table header scopes, labeled form controls, visible
  focus indicators, and native buttons/links. Do not remove focus outlines.
- `Dialog` uses the native `<dialog>` element and `showModal()`. Keep the title,
  optional description, and close action; let the browser supply modal focus
  containment/restoration and Escape handling. Call `onOpenChange(false)` when
  the dialog should close.

## Shared component props

| Component | Props / contract |
|---|---|
| `Button` | `variant` (`primary`, `secondary`, `ghost`, `danger`), `size` (`small`, `medium`), `type`, `loading`, `disabled`, standard button props and children. Loading disables the button and exposes busy state. |
| `Input` | `label`, `id`, `error`, `hint`, `as` (`input` by default; use `textarea` when needed), plus native control props such as `name`, `value`, and `onChange`. Generates an ID and connects label and help/error text. |
| `Select` | `label`, `id`, `error`, `hint`, `options` (`{ value, label, disabled? }[]`) or `children`, optional `placeholder`, and native select props. |
| `Dialog` | `open`, `onOpenChange(open)`, `title`, optional `description`, `children`, optional `className`. |
| `Badge` | `variant` (`neutral`, `primary`, `success`, `warning`, `danger`), `children`, optional `className`. Domain-to-variant mapping stays in the feature. |
| `Spinner` | `size` (`small` or `medium`), accessible `label`, optional `className`. |
| `PageHeader` | `title`, optional `description`, `eyebrow`, `actions`, `className`. |
| `LoadingState` | Optional `label` and `className`. |
| `EmptyState` | Optional `title`, `description`, `action`, `className`. |
| `ErrorState` | `error` or `message`, optional `onRetry`, `className`. |
| `ForbiddenState` | Optional `title`, `message`, and `onGoBack`. |
| `ConfirmDialog` | `open`, `onOpenChange`, `onConfirm`, optional labels/title/description, `isConfirming`, and `variant`. A rejected confirmation is shown inline and keeps the dialog open. |
| `PortalLayout` | Optional `children`; otherwise renders the nested route `<Outlet />`. The signed-in role is read from `useAuth()`. |
| `Sidebar`, `MobileNavigation` | `role`, optional `items` override. Items have `label`, `to`, and optional `end`. |
| `MedicineTable` | `medicines`, `canManage`, optional `onEdit(medicine)`, `onDelete(medicine)`, `busyMedicineId`. Management actions render only when `canManage` and a callback are supplied. |
| `MedicineForm` | Optional `medicine` for edit mode; `onSubmit({ name, description, price, stock_quantity })` must return/resolve a promise; optional `onCancel`, `isSubmitting`. |
| `NotificationList` | `notifications`, optional `onMarkRead(notificationId)`, optional `markingId`. Without `onMarkRead`, read actions are omitted. |

Use the components from `src/components` rather than adding portal-specific
copies. Use `ROLES` from `src/lib/constants.js` rather than spelling backend
role strings throughout portal code.

## Role navigation and authorization

`src/app/navigation/roleNavItems.js` is the shared source for desktop and mobile
navigation visibility. Current menus are:

- **Admin:** dashboard, patients, doctors, appointments, pharmacy, billing,
  reports, users, notifications.
- **Doctor:** patients, appointments, pharmacy, laboratory, medical records,
  prescriptions, notifications.
- **Patient:** home, appointments, laboratory, medical history, prescriptions,
  bills, notifications.

These are navigation links, not authorization. Portal route guards and the API
must enforce access independently. Unknown roles currently receive an empty menu.
Coordinate changes to `roleNavItems.js` with Enos before adding or renaming
portal routes, so labels/paths stay in sync with route ownership.

Pharmacy portal owners should derive UI permissions using the shared helper:

```jsx
import { ROLES } from "../lib/constants.js";
import { canManagePharmacy } from "../features/pharmacy/permissions.js";

const managesPharmacy = canManagePharmacy(user.role);

<MedicineTable
  medicines={medicines}
  canManage={managesPharmacy}
  onEdit={managesPharmacy ? openEdit : undefined}
  onDelete={managesPharmacy ? openDelete : undefined}
/>
```

`canManagePharmacy` returns true for admins only. Doctors can view the inventory
but do not receive create/update/delete controls; patients do not have a
pharmacy navigation item. This is presentation logic only: the backend remains
the security boundary and must reject unauthorized mutations.

## Pharmacy and notification data ownership

- Pharmacy list requests use `/api/pharmacy/medicines?page=…&per_page=…&search=…`;
  create uses `POST`, update uses `PATCH`, and delete uses `DELETE` on the item
  route. The shared API client adds the current bearer token.
- The API returns `{ medicines, metadata }` for list requests. Keep pagination
  metadata when adding controls; do not assume the response is an array.
- `usePharmacy({ page, perPage, search })` exposes the list query and
  `createMedicine`, `updateMedicine`, and `deleteMedicine` mutation objects.
  Successful mutations invalidate the pharmacy query cache.
- `NotificationsPage` derives its account ID from `useAuth()` and supplies it to
  `useNotifications(userId)`. Keep notification data/cache keys user-scoped.
  Do not take an arbitrary user ID from a URL or form for the signed-in user's
  notification actions.
- `markAsRead(notificationId)` calls
  `PATCH /api/notifications/{userId}/{notificationId}/read` and updates the
  matching cached item after success. The backend must enforce ownership (with
  any admin exception explicitly authorized there); a client-side ID is not an
  authorization check.

## Verification status and integration checks

Run the frontend checks from `FrontEnd/`:

```sh
npm test
npm run build
```

The component tests cover keyboard activation and dialog cancellation,
responsive navigation CSS breakpoints, active desktop/mobile nav links, all
three role menus, pharmacy admin-only controls, notification user-ID scoping,
and mark-read route/method selection.

Before calling portal integration complete, also verify in a running browser
and against the backend:

- Native dialog focus containment/restoration and Escape behavior in supported
  browsers (the automated DOM test covers semantics and cancellation only).
- Actual desktop/mobile computed layout at widths above and below 900px and
  600px, including no horizontal page overflow.
- Direct protected-route visits by each role; menu visibility alone does not
  protect a route.
- Notification GET/PATCH with the authenticated owner, a different user's ID,
  and the allowed admin policy; confirm non-owner requests fail server-side.
- Pharmacy read access for doctor/admin, mutation controls for admin only, and
  server rejection of doctor/patient mutation attempts.

The app's `src/app/router.jsx` remains a placeholder. Until portal owners wire
real routes and guards there, these feature components are reusable but are not
reachable as finished portal screens.
