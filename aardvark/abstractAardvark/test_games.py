from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase

class GameTest(APITestCase):

    def test_create_game(self):
        url = reverse('game_list')
        data_file = open('test_data/game_tests/game_create201.txt','r')
        data = data_file.read()
        data_file.close()
        data.replace('\n','')
        response = self.client.post(url, data, format = 'json')
        self.assertEqual(response.status_code, status,HTTP_201_CREATED)
        self.assertEqual(response.data, data)