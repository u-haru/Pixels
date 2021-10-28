/*
 *  This sketch sends data via HTTP GET requests to data.sparkfun.com service.
 *
 *  You need to get streamId and privateKey at data.sparkfun.com and paste them
 *  below. Or just customize this script to talk to other HTTP servers.
 *
 */

#include <WiFi.h>
#include <WiFiUDP.h>
#include <FastLED.h>
#include <AsyncUDP.h>

#define NUM_LEDS 2
#define PORT 1234

CRGB leds[NUM_LEDS];

const char* ssid     = "Halloween4pro";
const char* password = "HappyHalloween4pro";
static AsyncUDP udp;

void setupWiFi(){
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

void fade(uint8_t r,uint8_t g,uint8_t b){
    uint8_t diffr = (leds[0].red - r)/10;
    uint8_t diffg = (leds[0].green - g)/10;
    uint8_t diffb = (leds[0].blue - b)/10;
    for (u_int i = 0;i<9;i++){
        leds[0].red -= diffr;
        leds[0].green -= diffg;
        leds[0].blue -= diffb;
        leds[1] = leds[0];
        FastLED.show();
        delay(40);
    }
    leds[1] = leds[0] = CRGB(r,g,b);
    FastLED.show();
}

void udphandler(AsyncUDPPacket packet){
    if(packet.length() < 3) return;
    uint8_t colors[3];
    memcpy8(&colors,packet.data(),3);

    // uint32_t rgb = colors[0]<<16 | colors[1]<<8 | colors[2];
    // leds[0] = leds[1] = rgb;
    fade(colors[0], colors[1], colors[2]);
}

void setup()
{ 
    FastLED.addLeds<NEOPIXEL, 5>(leds, NUM_LEDS); 
    leds[0] = leds[1] = 0;
    FastLED.show();
    Serial.begin(115200);
    setupWiFi();

    if(udp.listen(PORT)) {
        Serial.print("UDP Listening on IP: ");
        Serial.println(WiFi.localIP());
        udp.onPacket(&udphandler);
    }
}

void loop()
{
}
