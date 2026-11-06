package com.nova.sosyal;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

/**
 * NOVA Sosyal Android uygulaması.
 * Sunucudaki NOVA Sosyal arayüzünü tam ekran açar; fotoğraf seçme, paylaşma
 * ve geri tuşu telefonun kendi özellikleriyle çalışır.
 */
public class MainActivity extends Activity {

    private static final int FILE_REQUEST = 7001;
    private static final String HOME = BuildConfig.SERVER_URL + "/";

    private WebView web;
    private ValueCallback<Uri[]> filePathCallback;
    private boolean showingError = false;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        web.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setUserAgentString(s.getUserAgentString() + " NovaSosyalApp/1.0");

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);

        web.addJavascriptInterface(new Bridge(), "NovaAndroid");
        web.setWebViewClient(new NovaClient());
        web.setWebChromeClient(new NovaChrome());

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl(HOME);
        }
    }

    // ---------- Sayfa içi gezinme ----------
    private class NovaClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            Uri home = Uri.parse(HOME);
            if (url.getHost() != null && url.getHost().equalsIgnoreCase(home.getHost())) {
                return false; // kendi sitemiz: uygulama içinde aç
            }
            // dış bağlantılar (web siteleri, mailto, tel...) telefonun ilgili uygulamasında açılır
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, url));
            } catch (ActivityNotFoundException e) {
                Toast.makeText(MainActivity.this, "Bu bağlantıyı açacak uygulama yok.", Toast.LENGTH_SHORT).show();
            }
            return true;
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            if (!url.startsWith("data:")) showingError = false;
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) showOffline();
        }
    }

    private void showOffline() {
        showingError = true;
        boolean dark = (getResources().getConfiguration().uiMode
                & android.content.res.Configuration.UI_MODE_NIGHT_MASK)
                == android.content.res.Configuration.UI_MODE_NIGHT_YES;
        String bg = dark ? "#0B0E1A" : "#F3F4F8";
        String fg = dark ? "#ECEEF7" : "#12152A";
        String mu = dark ? "#959BB6" : "#646A85";
        String ac = dark ? "#7891FF" : "#2F55F5";
        String html = "<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'>"
                + "<body style='margin:0;height:100vh;display:grid;place-items:center;background:" + bg + ";color:" + fg
                + ";font-family:sans-serif;text-align:center'><div style='padding:24px'>"
                + "<svg viewBox='0 0 32 32' width='56' height='56' fill='" + ac + "'><path d='M16 1c1 8.5 6.5 14 15 15-8.5 1-14 6.5-15 15-1-8.5-6.5-14-15-15 8.5-1 14-6.5 15-15z'/></svg>"
                + "<h2 style='margin:16px 0 8px'>Bağlanılamadı</h2>"
                + "<p style='color:" + mu + ";margin:0 0 20px'>İnternet bağlantını kontrol edip tekrar dene.</p>"
                + "<button onclick='NovaAndroid.retry()' style='border:0;border-radius:12px;padding:12px 22px;font-size:16px;font-weight:700;background:"
                + ac + ";color:" + bg + "'>Tekrar dene</button></div></body>";
        web.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
    }

    // ---------- Fotoğraf seçme ----------
    private class NovaChrome extends WebChromeClient {
        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (filePathCallback != null) filePathCallback.onReceiveValue(null);
            filePathCallback = callback;
            Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
            pick.addCategory(Intent.CATEGORY_OPENABLE);
            pick.setType("image/*");
            try {
                startActivityForResult(Intent.createChooser(pick, "Fotoğraf seç"), FILE_REQUEST);
            } catch (ActivityNotFoundException e) {
                filePathCallback = null;
                Toast.makeText(MainActivity.this, "Fotoğraf seçilemedi.", Toast.LENGTH_SHORT).show();
                return false;
            }
            return true;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_REQUEST && filePathCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null) {
                result = new Uri[]{data.getData()};
            }
            filePathCallback.onReceiveValue(result);
            filePathCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    // ---------- JavaScript köprüsü ----------
    private class Bridge {
        @JavascriptInterface
        public void share(String text) {
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_TEXT, text);
            runOnUiThread(() -> startActivity(Intent.createChooser(send, "Paylaş")));
        }

        @JavascriptInterface
        public void retry() {
            runOnUiThread(() -> web.loadUrl(HOME));
        }
    }

    // ---------- Geri tuşu ----------
    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (showingError) {
            finish();
        } else if (web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onPause() {
        web.onPause();
        CookieManager.getInstance().flush();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        web.destroy();
        super.onDestroy();
    }
}
