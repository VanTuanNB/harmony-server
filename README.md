# harmony-server

## Installation

```bash
    npm install
```

or

```bash
    yarn add
```

## Config environment variables

-   Create .env file in the root directory

```bash
    PORT_SERVER=your_port
    DATABASE_URL=your_database_url
    CURRENT_API_VERSION=v1
    GMAIL_SERVER=hamorymusic@gmail.com
    PASSWORD_GMAIL_SERVER=uvzdvwesamjfszkr
    SECRET_ACCESS_TOKEN=your_access_token
    SECRET_REFRESH_TOKEN=your_refresh_token
    GOOGLE_CLIENT_ID=1006389902930-pm8cnphoj0ufeh4vv4a7mgnt9epc12hv.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=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
    FACEBOOK_CLIENT_ID=661787541946531
    FACEBOOK_CLIENT_SECRET=cfb85d88b7d48929a11504871f7408d2
```

-   Generate token by command

```
    node
    require('crypto').randomBytes(64).toString('hex')
```

## Development mode

```bash
    npm run dev
```

or

```bash
    yarn dev
```

## Database

-   create Stack database in Mongoose Compass

```bash
    npm run insert-db
```

## Build mode

```bash
    npm start
```

or

```bash
    yarn start
```
