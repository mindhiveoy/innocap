import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
initializeApp({
  credential: cert({
    "type": "service_account",
    "project_id": "innocap-d56a0",
    "private_key_id": "a43771cc06cab0ab214ae51cfb2a079923973590",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDdcC+78THunNT1\nRx8vGK4mLIMsrZ0pQGktadHiwwBJBjp5E7jzLAaw6IpgRecVL5NBpimdCzlva2v6\n1wxcZtoBZN4l50T2iBwY2obyjnRfFKN3Cl4sai41Ew0aON6/eJTjKRGPO4pPfShc\n+yznGbY5n4IuO+U7qv6wl7K+21zQZ5aglo7o9P6VfWNhv40KCtvb54IKtXzmNZoF\nl3LbkxobHAsw/M9CFRDikBTm/nIiR5PSwh/qeYHGIRb5JwyrXj5jB/YiMLn2otRu\nfq21/vDwlRSiD1pxz1k8Vskpang+efV/TQkxiWG/9uCfBlGMZo8UYgmRIXRmbay1\nkk4IMP45AgMBAAECggEAKqoZ2FlBaJr5AQUiAf38V8iNwYb11+PcH+7ajJlLrcYw\nb/GX2epqo506RBBT1KYk9iogrGxkNY558IuMiyUZ7djUYHMtu15AI52/EG7YBxW/\n5QivWlle68Tu6lV4vWVrMlVQV8t9+5C+vSN75E706CdOer/5i8SHa9jejJ1RRanD\n/3MpjfVBuLca7lWdg/lNMpLXq9QrFvar5j1joJONPmjxiuHD3KetYtTkgKN9MoxP\nNgvfOi+ce5dj3AUQusgBF5uJbU1a3p8DdPPrXz85Eirlm6+ltuq9AGjfFEyHL3ZX\nIjKKHaoVjyzI/qJvWqX3+pDcc4pHS76GCvLj19L+nQKBgQDxHrYdDrTm9JH31RHg\nCHydXQ7AQMAVsSG1azUXAQOK/hGYoe6vde0c/VV9ekK0Cz3XA+wyQJFskVo08Xas\ntaHzRgv61CurdQ82yAij1InG5lqZFrlF3h+eBI9CooL0UPLXuA8mGNY7ZJX9nrZx\nC6arz716ykn806vcZQWLQ+ygHwKBgQDrGoltttXiGxL2LKEb5Jupe+f6Ucw6cIvW\nOweYQDDXrMegE9f/bn/cKh1EvI1mQx+tzEeJ1VEHIcMvFVCLbjWI2v/5lbFcrulk\nwxSTJxY8HdBVF8oZtw4wimYJwdlQT3X+M2PVbXtPhzljtmJd+iTRwsVMxtOt3dsP\nJ46hVzI2pwKBgQC5CAxQuBxyr3Pkb4nMFjcqu2K6ffXpr4hio+aVxJ1naBkwu/Ni\nimhvOqkEJXJSn93Qxp3W4l22psRGpJWha7Df8vz2eyMX7DjEnTSkJFGmZNdZa2q6\nBv7UUENvqy47NnNkv0ZAwgaEhWfkvIrcrUg1yLFrLRkh/31/H7blbDaFmQKBgBzn\nOUgEt0zB2VXsbK4aL8zpT76leb8hgP+IaEmecqLBOhWC+wYLFqsBfnGp4JRW4jki\nqRTX5ctDqlRKgYlytiAqFFghwBlN46GgnhHtNz2SyL79WrpIl/T9vseqTkYiTrY+\nqSJfAE7pp/OLQ5KcIxSqpkjnFLUGVl0Jlu5c4u53AoGAe6perBh2wvHJm+ElLPh6\nf+cC5+XJs8mAC6n6cEHA4s8jiOI/V7FkULPfJZ4ZFVw6EV4MLP6Xd1A49UAG4Tug\nrjbmjQBxFGw4ugwOp9zH8tUd9lbjoNsHQSdY8HFAAngRajRIeZufW3y6N3hNmC1a\nT+FSmLld2TJoBO11uIYjulQ=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-1mpat@innocap-d56a0.iam.gserviceaccount.com",
    "client_id": "100758376216168695019",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1mpat%40innocap-d56a0.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }),
  storageBucket: "innocap-d56a0.firebasestorage.app"
});

export const storage = getStorage(); 