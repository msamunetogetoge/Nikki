import os
import hashlib
import base64
from Crypto.Util import Padding
from Crypto.Cipher import AES
from Crypto import Random


if os.environ.get('_ENCRYPTO_KEY_') is not None:
    SECRET_KEY = os.environ['_ENCRYPTO_KEY_']
else:
    SECRET_KEY = ''.join(
        ["a" for i in range(32)])


class AESCipher(object):
    """CBCモードで、暗号化、複合化するクラス。
        CBCモードについては、
        https://csrc.nist.gov/publications/detail/sp/800-38a/final
        参照。
        大事なのは、iv という変数が暗号化されたバイト列の最初に挿入される事。
    Args:
        object (_type_): _description_
    """

    def __init__(self, key: str):
        """初期化

        Args:
            key (str): 暗号化、複合化に使うキー
        """
        self.key = (hashlib.md5(key.encode('utf-8')
                                ).hexdigest()).encode('utf-8')

    def encrypt(self, raw: str) -> bytes:
        """暗号化する。

        Args:
            raw (str): 暗号化したい文字列

        Returns:
            bytes: 暗号化されたバイト列
        """
        iv = Random.get_random_bytes(AES.block_size)
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        data = Padding.pad(raw.encode('utf-8'), AES.block_size, 'pkcs7')

        enc = base64.b64encode(iv + cipher.encrypt(data))
        return enc

    def decrypt(self, enc: bytes) -> str:
        """複合化

        Args:
            enc (bytes): 暗号化されたbytes

        Returns:
            str: 複合化された'文字列'
        """
        enc = base64.b64decode(enc)
        iv = enc[:AES.block_size]
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        data = Padding.unpad(cipher.decrypt(
            enc[AES.block_size:]), AES.block_size, 'pkcs7')
        return data.decode('utf-8')

    def decrypt_to_int(self, enc: bytes) -> int | ValueError:
        """
            intに複合化する。intにするのに失敗した時は、ValueErrorを返す
        Args:
            enc (bytes): 暗号化されたbytes

        Returns:
            int | ValueError: 複合化されたintか、エラー.
        """
        try:
            enc = base64.b64decode(enc)
            iv = enc[:AES.block_size]
            cipher = AES.new(self.key, AES.MODE_CBC, iv)
            data = Padding.unpad(cipher.decrypt(
                enc[AES.block_size:]), AES.block_size, 'pkcs7')
            dec = data.decode('utf-8')

            return int(dec)
        except ValueError as value_error:
            print(value_error)
            raise value_error
        except Exception as e:
            print(e)
            raise e


CIPHER = AESCipher(key=SECRET_KEY)


def decrypt_from_url_row_to_int(row: str) -> int | Exception:
    """url パラメータで暗号化された文字列を貰った時、intに複合化する。

    Args:
        row (str): 複合化したい文字列

    Raises:
        e: エラー

    Returns:
        int:複合化した結果
    """
    row = row.replace(" ", "+")
    try:
        int_value = CIPHER.decrypt_to_int(bytes(row, 'utf-8'))
        return int_value
    except Exception as e:
        raise e
