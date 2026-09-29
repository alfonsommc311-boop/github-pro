import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_tts/flutter_tts.dart';

// Servidor local que sirve la app de aprendizaje en http://localhost:8983
// Puerto propio por app de la familia para evitar el conflicto
// "Address already in use" cuando otra app de la familia está activa.
const int kServerPort = 9048;
final InAppLocalhostServer _server = InAppLocalhostServer(port: kServerPort);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Si el puerto estuviera ocupado, no congelamos la app en el splash:
  // capturamos el error y arrancamos igual (el WebView reintenta cargar).
  try {
    await _server.start();
  } catch (e) {
    debugPrint('No se pudo iniciar el servidor local: $e');
  }
  runApp(const GitHubPROApp());
}

class GitHubPROApp extends StatelessWidget {
  const GitHubPROApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GitHub PRO',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF58A6FF),
        scaffoldBackgroundColor: const Color(0xFF0D1118),
        useMaterial3: true,
        brightness: Brightness.dark,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  InAppWebViewController? _web;
  final FlutterTts _tts = FlutterTts();
  bool _loading = true;
  double _rate = 0.5; // velocidad de lectura por defecto

  @override
  void initState() {
    super.initState();
    _initTts();
  }

  Future<void> _initTts() async {
    await _tts.awaitSpeakCompletion(true);
    try { await _tts.setLanguage('es-ES'); } catch (_) {}
    try { await _tts.setSpeechRate(_rate); } catch (_) {}
    await _tts.setPitch(1.0);
    // Cuando termina o se cancela, avisa al WebView para restablecer el botón.
    _tts.setCompletionHandler(() {
      _web?.evaluateJavascript(source: "window.__ttsDone && window.__ttsDone();");
    });
    _tts.setCancelHandler(() {
      _web?.evaluateJavascript(source: "window.__ttsDone && window.__ttsDone();");
    });
  }

  Future<void> _handleTts(dynamic arg) async {
    if (arg is! Map) return;
    final cmd = arg['cmd'];
    if (cmd == 'stop') {
      await _tts.stop();
      return;
    }
    if (cmd == 'rate') {
      final r = double.tryParse('${arg['rate']}');
      if (r != null) {
        _rate = r.clamp(0.2, 1.0);
        try { await _tts.setSpeechRate(_rate); } catch (_) {}
      }
      return;
    }
    if (cmd == 'speak') {
      final text = (arg['text'] ?? '').toString();
      if (text.trim().isEmpty) return;
      await _tts.stop();
      try { await _tts.setSpeechRate(_rate); } catch (_) {}
      // Reintenta español por si el dispositivo usa otra variante.
      try { await _tts.setLanguage('es-ES'); } catch (_) {
        try { await _tts.setLanguage('es-US'); } catch (_) {}
      }
      await _tts.speak(text);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D1118),
      body: SafeArea(
        child: PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, _) async {
            if (didPop) return;
            await _tts.stop();
            if (_web != null && await _web!.canGoBack()) {
              _web!.goBack();
            } else {
              SystemNavigator.pop();
            }
          },
          child: Stack(
            children: [
              InAppWebView(
                initialUrlRequest: URLRequest(
                    url: WebUri('http://localhost:$kServerPort/assets/web/index.html')),
                initialSettings: InAppWebViewSettings(
                  javaScriptEnabled: true,
                  transparentBackground: true,
                  supportZoom: false,
                  algorithmicDarkeningAllowed: true,
                ),
                onWebViewCreated: (controller) {
                  _web = controller;
                  controller.addJavaScriptHandler(
                    handlerName: 'tts',
                    callback: (args) {
                      if (args.isNotEmpty) _handleTts(args.first);
                      return null;
                    },
                  );
                },
                onLoadStop: (controller, url) {
                  if (mounted) setState(() => _loading = false);
                },
              ),
              if (_loading)
                const Center(child: CircularProgressIndicator()),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tts.stop();
    super.dispose();
  }
}
