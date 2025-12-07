# PauseAI CMS

[![Netlify Status](https://api.netlify.com/api/v1/badges/d24700b8-9bf5-47e2-a140-46d257dc2250/deploy-status)](https://app.netlify.com/projects/pauseai-cms/deploys)

This project is a Decap CMS configuration, enhanced with several plugins, for the PauseAI website.

## Features

- Based on [Decap CMS](https://decapcms.org/)
- Uses [Vite](https://vitejs.dev/) for development and building
- **GitHub Apps Authentication**: Uses [decap-proxy-github-apps](https://github.com/PauseAI/decap-proxy-github-apps) for GitHub Apps authentication instead of classic OAuth
- **Logo Plugin**
    - Adds a custom logo to the navigation bar.
- **Prettier Plugin**:
    - Integrates [Prettier](https://prettier.io/) for code formatting within the CMS editor.
    - Automatically formats markdown content in the body field before saving entries, ensuring consistent content formatting.
- **Slug Plugin**:
    - Disables the slug field when editing existing entries as slugs cannot be changed after creation.
    - Infers the slug if it isn't specified in the metadata.
    - Hides the "optional" label for the slug field, as it is actually required but only for new posts.
- **JSON Dictionary Plugin**:
    - Enables Decap CMS to handle dictionaries by converting them to and from arrays of objects.
    - Registers a custom format named `json_dict` for `.json` files.
- **JSON Tabs Plugin**:
    - Registers a custom format named `json_tabs` for `.json` files.
    - This format ensures that JSON files are saved with tab indentation.
- **Dark Mode**: Implements dark mode support using [Darkreader](https://darkreader.org/).

## Collections

### Posts

The CMS is configured for managing "posts" with the following fields:

- `title`: Title of the post (String)
- `slug`: Slug for the post URL (String, optional, but in practice required for new posts)
- `description`: Short description of the post (String, optional)
- `image`: Featured image for the post (Image, optional)
- `author`: Author of the post (String, optional)
- `date`: Date of the post (Datetime, optional)
- `body`: Main content of the post (Markdown)

### Communities

The `communities` collection manages community data, displayed on [pauseai.info/communities](https://pauseai.info/communities). It uses the `json_tabs` format and includes two files:

- **PauseAI communities** (`src/routes/communities/pauseai-communities.json`)
    - `communities`: A list of communities, each with:
        - `name`: Name of the community (String)
        - `lat`: Latitude (Number)
        - `lon`: Longitude (Number)
        - `link`: Link to the community (String)

- **Adjacent communities** (`src/routes/communities/adjacent-communities.json`)
    - `communities`: A list of communities, each with:
        - `name`: Name of the community (String)
        - `lat`: Latitude (Number)
        - `lon`: Longitude (Number)
        - `link`: Link to the community (String)

### Messages

The `messages` collection manages localized message strings. It uses the `json_dict` format.

- **English Messages** (`messages/en.json`)
    - `entries`: A list of key-value pairs, which is a temporary representation produced by the JSON Dictionary Plugin. The underlying JSON file is a dictionary. Each item in the list has:
        - `key`: The unique identifier for the message (String)
        - `value`: The message string (String)

### Quotes

The `quotes` collection manages quotes data, displayed on [pauseai.info/quotes](https://pauseai.info/quotes). It uses the `json_tabs` format and includes one file:

- **PauseAI Quotes** (`src/routes/quotes/data.json`)
    - `quotes`: A list of quotes, each with:
        - `background`: Background color/image for the quote (String)
        - `color`: Text color for the quote (String, optional)
        - `text`: The quote text (String)
        - `author`: The author of the quote (String)
        - `author_description`: Description of the author (String)
        - `padding`: Padding for the quote (String, optional)
        - `notice`: Any notice related to the quote (String, optional)

## Backend

- **Backend**: GitHub
- **Repository**: `PauseAI/pauseai-website`
- **Branch**: `main`

## Dependencies

- `darkreader`: For dark mode support
- `decap-cms-app`: The Decap CMS application
- `prettier`: Code formatter
- `react` and `react-dom`: React libraries (Decap CMS dependency)
- `vite`: Build tool
- `vitest`: For unit testing

## Development

To run the development server:

```bash
pnpm dev
```

## Build

To build the project:

```bash
pnpm build
