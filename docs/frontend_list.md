# Frontend Page & Component List

Extracted from `nikki_nuxt/`.

## Pages (`/pages`)

| Path       | File          | Description                                        |
| :--------- | :------------ | :------------------------------------------------- |
| `/`        | `index.vue`   | Landing page / Login / Entry point                 |
| `/home`    | `home.vue`    | Main dashboard (likely displays nikki list)        |
| `/search`  | `search.vue`  | Search interface                                   |
| `/signup`  | `signup.vue`  | User registration page                             |
| `/trial`   | `trial.vue`   | Trial user dashboard                               |
| `/user`    | `user.vue`    | User profile/settings                              |
| `/inspire` | `inspire.vue` | (Likely default Nuxt template page, check if used) |

## Components (`/components`)

| Component     | File              | Description                                    |
| :------------ | :---------------- | :--------------------------------------------- |
| `NikkiDialog` | `NikkiDialog.vue` | Dialog for creating/editing a Nikki            |
| `NikkiList`   | `NikkiList.vue`   | List view for Nikkis                           |
| `NikkiBottun` | `NikkiBottun.vue` | Floating action button (likely to open dialog) |
| `Tutorial`    | `Tutorial.vue`    | Tutorial component                             |
| `GuruGuru`    | `GuruGuru.vue`    | Loading spinner                                |
| `common/*`    | `common/`         | Common utilities/components                    |
| `search/*`    | `search/`         | Search related components                      |
| `tag/*`       | `tag/`            | Tag related components                         |

## Layouts (`/layouts`)

| Layout    | File          | Description                                                |
| :-------- | :------------ | :--------------------------------------------------------- |
| `default` | `default.vue` | Main application layout with Navigation Drawer and App Bar |
