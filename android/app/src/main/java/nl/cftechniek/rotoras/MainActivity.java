package nl.cftechniek.rotoras;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.util.Log;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.print.PrintManager;
import android.webkit.*;
import androidx.webkit.WebViewAssetLoader;
import java.io.*;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private WebView web;
    private String pendingId, pendingText;
    private static final int OPEN=1, SAVE=2, LIMIT=10*1024*1024;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web=new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        WebViewAssetLoader loader=new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient(){
            @Override public void onPageFinished(WebView view,String url){
                view.postDelayed(()->view.evaluateJavascript("Boolean(document.querySelector('h1') && document.querySelector('.shaft-panel') && window.RotorasAndroid)",value->Log.i("RotorasReady",value)),1000);
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){return loader.shouldInterceptRequest(request.getUrl());}
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                Uri u=request.getUrl();return !"https".equals(u.getScheme())||!"appassets.androidplatform.net".equals(u.getHost())||!u.getPath().startsWith("/assets/");
            }
        });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onConsoleMessage(ConsoleMessage message){
                if(message.messageLevel()==ConsoleMessage.MessageLevel.ERROR)Log.e("RotorasJS",message.message());return true;
            }
            @Override public boolean onJsConfirm(WebView view,String url,String message,JsResult result){
                new AlertDialog.Builder(MainActivity.this).setMessage(message)
                    .setPositiveButton("OK",(d,w)->result.confirm())
                    .setNegativeButton("Annuleren",(d,w)->result.cancel())
                    .setOnCancelListener(d->result.cancel()).show();return true;
            }
        });
        web.addJavascriptInterface(new Bridge(),"RotorasAndroid");
        setContentView(web);
        // Keep controls clear of status/navigation bars and adapt to the keyboard.
        web.setOnApplyWindowInsetsListener((v,insets)->{
            v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;
        });
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }
    private void reply(String id,Object value,String error){
        try {JSONObject data=new JSONObject();data.put("id",id);data.put("value",value==null?JSONObject.NULL:value);if(error!=null)data.put("error",error);
            web.evaluateJavascript("window.rotorasAndroidResult("+data.toString()+")",null);
        } catch(Exception ignored) {}
    }
    public class Bridge {
        @JavascriptInterface public void request(String json){runOnUiThread(()->{
            String id="";
            try {
                JSONObject q=new JSONObject(json);id=q.getString("id");String action=q.getString("action");
                if(action.equals("print")){
                    PrintManager manager=(PrintManager)getSystemService(PRINT_SERVICE);
                    manager.print("Rotoras werktekening",web.createPrintDocumentAdapter("Rotoras werktekening"),null);
                    reply(id,true,null);return;
                }
                if(pendingId!=null){reply(id,null,"Er staat al een bestandsvenster open.");return;}
                if(!action.equals("open")&&!action.equals("save"))throw new Exception("Onbekende actie.");
                Intent intent;
                if(action.equals("save")){
                    String name=q.getString("name");
                    if(!name.toLowerCase().matches(".*\\.(csv|json|svg)$"))throw new Exception("Kies CSV, JSON of SVG.");
                    String text=q.getString("text");if(text.getBytes(StandardCharsets.UTF_8).length>LIMIT)throw new Exception("Bestand is groter dan 10 MB.");
                    intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);intent.setType(q.getString("mime"));intent.putExtra(Intent.EXTRA_TITLE,name);
                    pendingText=text;
                }else{intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);intent.setType("*/*");}
                intent.addCategory(Intent.CATEGORY_OPENABLE);pendingId=id;
                startActivityForResult(intent,action.equals("save")?SAVE:OPEN);
            }catch(Exception e){pendingId=null;pendingText=null;reply(id,null,"Bestandsactie mislukt: "+e.getMessage());}
        });}
    }
    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);
        if(request!=OPEN&&request!=SAVE)return;
        String id=pendingId,text=pendingText;pendingId=null;pendingText=null;
        if(id==null)return;
        if(result!=RESULT_OK||data==null||data.getData()==null){reply(id,null,null);return;}
        Uri uri=data.getData();
        new Thread(()->{
            try {
                String name="Rotoras.rotoras.json";
                try(Cursor c=getContentResolver().query(uri,new String[]{OpenableColumns.DISPLAY_NAME},null,null,null)){if(c!=null&&c.moveToFirst())name=c.getString(0);}
                final Object value;
                if(request==SAVE){try(OutputStream out=getContentResolver().openOutputStream(uri,"wt")){if(out==null)throw new IOException("Bestand niet bereikbaar.");out.write(text.getBytes(StandardCharsets.UTF_8));}value=name;}
                else{
                    if(!name.toLowerCase().matches(".*\\.(csv|json)$"))throw new IOException("Kies een CSV- of Rotoras-projectbestand.");
                    ByteArrayOutputStream bytes=new ByteArrayOutputStream();
                    try(InputStream in=getContentResolver().openInputStream(uri)){if(in==null)throw new IOException("Bestand niet bereikbaar.");byte[] buffer=new byte[8192];int n;while((n=in.read(buffer))!=-1){if(bytes.size()+n>LIMIT)throw new IOException("Bestand is groter dan 10 MB.");bytes.write(buffer,0,n);}}
                    JSONObject file=new JSONObject();file.put("name",name);file.put("text",bytes.toString("UTF-8"));value=file;
                }
                runOnUiThread(()->reply(id,value,null));
            }catch(Exception e){runOnUiThread(()->reply(id,null,"Bestandsactie mislukt: "+e.getMessage()));}
        }).start();
    }
    @Override protected void onPause(){web.evaluateJavascript("window.dispatchEvent(new Event('rotoras-save-now'))",null);super.onPause();}
    @Override protected void onDestroy(){web.destroy();super.onDestroy();}
}
